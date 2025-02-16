from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import io
import os
import subprocess
import tempfile 
from google import genai
from pathlib import Path
import time
import pathlib
import json 
from google.genai import types
import re
import ast 

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
SUPPORTED_TYPES = {'audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/ogg'}


# Initialize Gemini client
GOOGLE_API_KEY = "AIzaSyC29R81_8TNSyUHv0o9hemVRhIGx8FHTms"
client = genai.Client(api_key=GOOGLE_API_KEY)
MODEL_ID = "gemini-2.0-flash-exp"


SYSTEM_PROMPT = """You are an advanced emotional state analysis AI. 

    # 1. Stress Score (0=calm, 1=highly stressed) based on:
    #    - The user's speech (weight: 40%)
    #    - Facial muscle tension (weight: 30%)
    #    - Pupil dilation variation (weight: 20%)
    #    - Micro-expression frequency (weight: 25%)
    #    - Head movement patterns (weight: 25%)
    #    

    #    Take into account the user audio as the most important aspect.

    # Analyze the video and return:
    # 1. 10-element array of stress scores (0=calm, 1=stressed)
    # 2. Parallel array of key moments explaining score changes

    Return the analysis in the following format:
    "stressScores": [number], // Array of 10 scores between 0-1
    "keyMoments": [string],   // Array of 10 explanations
    """

def parse_response(response_text):
    # Extract stress scores
    stress_scores_pattern = r'"stressScores":\s*\[([\d.,\s]+)\]'
    stress_scores_match = re.search(stress_scores_pattern, response_text)
    stress_scores = []
    if stress_scores_match:
        scores_string = stress_scores_match.group(1)
        stress_scores = [float(score) for score in re.findall(r'[\d.]+', scores_string)]

    # Extract key moments
    key_moments_pattern = r'"keyMoments":\s*\[(.*?)\]'
    key_moments_match = re.search(key_moments_pattern, response_text, re.DOTALL)
    key_moments = []
    if key_moments_match:
        moments_string = key_moments_match.group(1)
        key_moments = re.findall(r'"([^"]+)"', moments_string)

    # Format the response
    formatted_response = {
        "status": "success",
        "data": {
            "stressScores": stress_scores,
            "keyMoments": key_moments
        }
    }
    
    return formatted_response

@app.post("/upload_video")
async def upload_video(file: UploadFile = File(...)):
    TEMP_VIDEO_DIR = "temp_videos"
    os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)
    
    try:
        # Validate file type
        if not file.content_type.startswith("video/"):
            raise HTTPException(400, "Invalid video file format")

        # Save uploaded content to temp file
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix, dir=TEMP_VIDEO_DIR) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        # Upload to Gemini storage
        file_upload = client.files.upload(
            file=temp_path
        )

        # print(upload_result)
        while file_upload.state == "PROCESSING":
            print('Waiting for video to be processed.')
            time.sleep(10)
            file_upload = client.files.get(name=file_upload.name)

        if file_upload.state == "FAILED":
            raise ValueError(file_upload.state)
        print(f'Video processing complete: ' + file_upload.uri)

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=file_upload.uri,
                            mime_type=file_upload.mime_type),
                        ]),
                SYSTEM_PROMPT,
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.0,
            ),
        )

        # print(response.text)
        parsed_data = parse_response(response.text)
        # print("Parsed --->", parsed_data)
        return JSONResponse(content=parsed_data)

        
    except HTTPException as he:
        raise
    except Exception as e:
        raise HTTPException(500, f"Processing failed: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        if 'temp_path' in locals(): os.unlink(temp_path)
        if 'upload_result' in locals(): client.files.delete(upload_result.name)
        raise HTTPException(500, f"Processing failed: {str(e)}")

def process_audio(file_path: str):
    try:
        result = subprocess.run(
            ["python", "./audio_measure.py", "--audio_path", file_path],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        error_msg = f"Processing failed: {e.stderr.strip()}"
        # print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

# Assuming your string is stored in 'results_string'
def parse_results(results_string):
    # Convert string to dictionary
    results_dict = ast.literal_eval(results_string)
    
    # Extract values
    formatted_results = {
        "arousal": results_dict['arousal'],
        "dominance": results_dict['dominance'],
        "valence": results_dict['valence'],
        "stress": results_dict['stress'],
        "three_d": [list(coord) for coord in results_dict['three_d']]  # Convert tuples to lists
    }
    
    return formatted_results

@app.post("/process_audio")
async def process_audio_endpoint(file: UploadFile = File(...)):
    try:
        # Validate file type
        if file.content_type not in SUPPORTED_TYPES:
            raise HTTPException(400, "Unsupported file type")

        # Read and validate file size
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(413, "File too large. Max 25MB")

        # Convert to WAV format
        audio = AudioSegment.from_file(io.BytesIO(file_bytes))
        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format="wav")
        
        # Save processed file
        save_dir = "processed_audio"
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, f"processed_{file.filename}.wav")
        
        with open(file_path, "wb") as f:
            f.write(wav_buffer.getvalue())

        # Process audio
        results = process_audio(file_path)
        # print(1)
        # print(results)
        formatted_results = parse_results(results)

        return JSONResponse(
            content={
                "status": "success",
                "data": formatted_results
            }
        )

        # formatted_results = convert_tuples_to_arrays(results)
    
        # return JSONResponse(content={
        #     "status": "success",
        #     "data": {
        #         "results": formatted_results,
        #         "filename": file.filename
        #     }
        # })
        
        return JSONResponse(content={"results": results, "filename": file.filename})

    except Exception as e:
        print(f"Processing error: {str(e)}")
        raise HTTPException(500, "Audio processing failed") from e


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


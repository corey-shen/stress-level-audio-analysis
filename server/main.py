from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import io
import os
import subprocess

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
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

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
        
        return JSONResponse(content={"results": results, "filename": file.filename})

    except Exception as e:
        print(f"Processing error: {str(e)}")
        raise HTTPException(500, "Audio processing failed") from e

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


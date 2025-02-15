from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def process_audio(file_bytes: bytes):
    # Replace this dummy function with your actual model logic.
    # For example, load the audio bytes using librosa or any preferred library,
    # run your PyTorch model (with Hugging Face transformers), and return the result.
    #
    # Dummy output:
    return [0,1,1,1,0,1,0]

@app.post("/process_audio")
async def process_audio_endpoint(file: UploadFile = File(...)):
    try:
        # Read the audio file from the uploaded file
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Process the audio file bytes using our custom model
    results = process_audio(file_bytes)
    
    # Return the results as a JSON response
    return JSONResponse(content={"results": results})



if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

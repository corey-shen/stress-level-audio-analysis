import React, { useState, useRef } from "react";
import axios from "axios";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false); // Bool for tracking if recording is in progress
  const [audioBlob, setAudioBlob] = useState(null);  // Stores the recorded audio as a binary object
  const [audioURL, setAudioURL] = useState(null);    // Stores a URL to play the recorded audio
  const mediaRecorderRef = useRef(null);             // Reference to MediaRecorder object
  const audioChunksRef = useRef([]);                 // Stores small chunks of recorded audio data

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request microphone access
      mediaRecorderRef.current = new MediaRecorder(stream); // Returns audio stream if microphone access is granted

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);    // Create a MediaRecorder object to record stream
      };

      mediaRecorderRef.current.onstop = () => { // Store audio in audioChunksRef
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);
        audioChunksRef.current = []; // Clear for next recording
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Upload Audio to Flask Backend
  const uploadAudio = async () => {
    if (!audioBlob) return alert("No audio recorded!");

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav"); // Create a FormData object 

    try {
      const response = await axios.post("http://127.0.0.1:8000/process_audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload successful:", response.data);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      {audioURL && <audio controls src={audioURL} />}
      <button onClick={uploadAudio} disabled={!audioBlob}>
        Upload Audio
      </button>
    </div>
  );
};

export default AudioRecorder;

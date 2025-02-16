
// ---------------------------------------------------
import React, { useState, useRef } from "react";
import axios from "axios";
import EmotionGraphs from "./EmotionGraph2D";
import Scene3D from "./Scene3D";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false); // Track if recording is active
  const [audioBlob, setAudioBlob] = useState(null);  // Store recorded audio
  const [audioURL, setAudioURL] = useState(null);    // Store audio playback URL
  const mediaRecorderRef = useRef(null);             // Reference to MediaRecorder
  const audioChunksRef = useRef([]);                 // Store recorded audio chunks


  const [emotionData, setEmotionData] = useState({
    arousal: new Array(10).fill(0),
    dominance: new Array(10).fill(0),
    valence: new Array(10).fill(0),
    stress: new Array(10).fill(0),
    three_d: new Array(10).fill([0, 0, 0])  // For 3D coordinates
  });

  const [hasEmotionData, setHasEmotionData] = useState(false)

  // 🎙 Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request mic access
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
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

  // ⏹ Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // // 📤 Upload Audio
  // const uploadAudio = async () => {
  //   if (!audioBlob) return alert("No audio recorded!");

  //   const formData = new FormData();
  //   formData.append("file", audioBlob, "recording.wav");

  //   try {
  //     const response = await axios.post("http://127.0.0.1:8000/process_audio", formData);
  //     console.log("Upload successful:", response.data);
  //     alert("Upload successful!");
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     alert("Upload failed!");
  //   }
  // };

  const uploadAudio = async () => {
    if (!audioBlob) return alert("No audio recorded!");
  
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/process_audio", formData);
      console.log("Upload successful:", response.data);
      
      // Update the state with the response data
      setEmotionData({
        arousal: response.data.data.arousal,
        dominance: response.data.data.dominance,
        valence: response.data.data.valence,
        stress: response.data.data.stress,
        three_d: response.data.data.three_d
      });
  
      alert("Upload successful!");
      setHasEmotionData(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };
  

  return (
    <div>
      <h2>Audio Recorder</h2>

      {/* Conditionally Render Buttons */}
      {!recording ? (
        <button onClick={startRecording} style={{ backgroundColor: "#4CAF50", color: "white" }}> 
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} style={{ backgroundColor: "#ff4d4d", color: "white" }}>
          Stop Recording
        </button>
      )}

      {/* Audio Player */}
      {audioURL && <audio controls src={audioURL} style={{ marginLeft: "10px" }} />}

      {/* Upload Button */}
      <button onClick={uploadAudio} disabled={!audioBlob} style={{ backgroundColor: "#dee2e6", color: "black", marginLeft: "10px" }}>
        Upload Audio
      </button>
      {hasEmotionData && (
        <EmotionGraphs 
          emotionData={emotionData}
        />
      )}
      {hasEmotionData && (
        <Scene3D 
            testData={emotionData}
        />
      )}
      
    </div>
  );
};

export default AudioRecorder;
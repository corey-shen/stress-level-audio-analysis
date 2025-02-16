import React from "react";
import AudioRecorder from "./AudioRecorder.js";
import EmotionGraph2D from "./EmotionGraph2D.js";
import Scene3D from "./Scene3D.js";
import "../App.css";
import { useNavigate } from "react-router-dom";

function AudioProcessing() {
  const navigate = useNavigate();

  return (
    <div className="AudioProcessing">
      {/* ✅ Move Home Icon to the Left */}
      <img
        src="/homepage-image.png" /* Adjust path if using src/assets */
        alt="Home"
        className="home-logo"
        onClick={() => navigate("/")}
      />

      <h1 className="audio-title">Audio Stress Level Analyzer</h1>
      <AudioRecorder />
      <EmotionGraph2D />
      <Scene3D />
    </div>
  );
}

export default AudioProcessing;

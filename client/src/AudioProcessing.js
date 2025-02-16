import React from "react";
import AudioRecorder from "./components/AudioRecorder.js";
import EmotionGraph2D from "./components/EmotionGraph2D.js";
import Scene3D from './components/Scene3D.js';
import './App.css';

function AudioProcessing() {
  return (
    <div className="AudioProcessing">
      <h1>Audio Stress Level Analyzer</h1>
      <AudioRecorder />    
      <EmotionGraph2D />
      <Scene3D />
    </div>
  );
}

export default AudioProcessing;

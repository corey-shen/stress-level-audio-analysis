import React from "react";
import AudioRecorder from "./AudioRecorder.js";
import EmotionGraph2D from "./EmotionGraph2D.js";
import Scene3D from './Scene3D.js';
import '../App.css';

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

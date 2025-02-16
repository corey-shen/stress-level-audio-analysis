import React from "react";
import AudioRecorder from "./components/AudioRecorder.js";
import EmotionGraph2D from "./components/EmotionGraph2D.js";
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Audio Stress Level Analyzer</h1>
      <AudioRecorder />    
      <EmotionGraph2D />
    </div>
  );
}

export default App;

import React from "react";
import AudioRecorder from "./components/AudioRecorder.js";
import EmotionGraph2D from "./components/EmotionGraph2D.js";
import './App.css';

const sampleData = {
  arousal: [1.0, 0.5623, 0.8391, 0.587, 0.6122, 0.3325, 0.1177, 0.4345, 0.956, 0.8919],
  dominance: [0.9571, 0.5887, 0.7914, 0.5969, 0.597, 0.4325, 0.2521, 0.5236, 0.9302, 0.9012],
  valence: [0.2811, 0.4389, 0.3126, 0.513, 0.693, 0.346, 0.1785, 0.2195, 0.1624, 0.2003],
  stress: [0.9495, 0.316, 0.6812, 0.3339, 0.3416, 0.1309, 0.033, 0.2171, 0.8934, 0.7807]
};

function App() {
  return (
    <div>
      <h1>Audio Stress Level Analyzer</h1>
      <AudioRecorder />    
      <EmotionGraph2D />
    </div>
  );
}

export default App;

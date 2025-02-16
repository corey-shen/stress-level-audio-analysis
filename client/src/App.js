import React from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage.js";
import AudioProcessing from "./components/AudioProcessing.js";
import TranscriptProcessing from "./components/TranscriptProcessing.js";
import VideoRecorder from "./components/VideoRecorder.js";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/audio" element={<AudioProcessing />} />
                <Route path='/transcript' element={<TranscriptProcessing />} />
                <Route path="/video" element={<VideoRecorder />} />
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
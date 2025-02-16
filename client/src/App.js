import React from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage.js";
import AudioProcessing from "./components/AudioProcessing.js";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/audio" element={<AudioProcessing />} />
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
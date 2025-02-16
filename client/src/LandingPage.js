import React from "react";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Mood and Metrics</h1>
        <h2 className="landing-tagline">Mapping Emotions with AI - Visualizing Mood in Real Time.</h2>

        <div className="landing-buttons">
          <button className="landing-button" onClick={() => window.location.href = '/audio'}>
            🎵 Audio Processing
          </button>
          <button className="landing-button" onClick={() => window.location.href = '/video'}>
            🎥 Video Processing
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

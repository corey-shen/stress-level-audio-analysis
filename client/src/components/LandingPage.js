import React from "react";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Mood and Metrics</h1>
        <h2 className="landing-tagline">Hyperanalyze your mood with a simple click of a button. See your emotions clearly through audio, video, and transcription sentiment analysis, and take control of your mental well-being!</h2>

        <div className="landing-buttons">
          <button className="landing-button" onClick={() => window.location.href = '/audio'}>
            🎵 Audio Processing
          </button>
          
          <button className="landing-button" onClick={() => window.location.href = '/video'}>
            🎥 Video Processing
          </button>

          <button className="landing-button" onClick={() => window.location.href = '/transcript'}>
            . Transcript Processing
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

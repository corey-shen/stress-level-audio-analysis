import React from "react";
import { useNavigate } from "react-router-dom";
import AudioRecorder from "./AudioRecorder"; // Make sure to import AudioRecorder

function TranscriptProcessing() {
  const navigate = useNavigate();

  return (
    <div className="transcript-processing">
      <h1>Transcript Processing</h1>
      <div className="AudioProcessing">
        <img
          src="/homepage-image.png" /* Adjust path if using src/assets */
          alt="Home"
          className="home-logo"
          onClick={() => navigate("/")}
        />
        <AudioRecorder />
      </div>
    </div>
  );
}

export default TranscriptProcessing;
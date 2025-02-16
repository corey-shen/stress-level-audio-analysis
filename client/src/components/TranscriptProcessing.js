import React from "react";
import { useNavigate } from "react-router-dom";
import AudioRecorder from "./AudioRecorder"; // Make sure to import AudioRecorder
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as d3 from 'd3';


function TranscriptProcessing() {
  const navigate = useNavigate();


  const [recording, setRecording] = useState(false); // Track if recording is active
  const [audioBlob, setAudioBlob] = useState(null);  // Store recorded audio
  const [audioURL, setAudioURL] = useState(null);    // Store audio playback URL
  const mediaRecorderRef = useRef(null);             // Reference to MediaRecorder
  const audioChunksRef = useRef([]);

  const [expanded, setExpanded] = useState(false);

  const [stressScores, setStressScores] = useState([]);
  const [keyMoments, setKeyMoments] = useState([]);


  // 🎙 Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request mic access
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);
        audioChunksRef.current = []; // Clear for next recording
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // ⏹ Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  
  const uploadAudio = async () => {
    if (!audioBlob) return alert("No audio recorded!");
  
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/upload_transcript", formData);
      console.log("Upload successful:", response.data);

      setStressScores(response.data.data.stressScores)
      setKeyMoments(response.data.data.keyMoments)
  
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };

  const createGraph = (containerId, values, label, color) => {
    const safeValues = Array.isArray(values) ? values : [];
    d3.select(`#${containerId}`).selectAll('*').remove();

    const margin = { top: 20, right: 50, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('display', 'block')
        .style('margin', '0 auto')
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, values.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Add X axis with label
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', 40)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .text('Time (s)');

    // Add Y axis with label
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .text(label);

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(''));

    // Create line
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Add line path
    svg.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    svg.selectAll('circle')
      .data(values)
      .enter()
      .append('circle')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', d => yScale(d))
        .attr('r', 4)
        .attr('fill', color);
  };

  useEffect(() => {
    if (!stressScores) return;
    createGraph('stress-graph', stressScores, 'Stress Level', '#9C27B0');

    // createGraph('stress-graph', [0.1, 0.1, 0.1, 0.7, 0.9, 0.9, 0.9, 0.8, 0.7, 0.7], 'Stress Level', '#9C27B0');

  }, [stressScores]);

  return (
    <div>
      <h2>Stress Level Analyzer via Transcript</h2>
        <div className="AudioProcessing">
          <img
            src="/homepage-image.png" /* Adjust path if using src/assets */
            alt="Home"
            className="home-logo"
            onClick={() => navigate("/")}
          />
        </div>

      {/* Conditionally Render Buttons */}
      {!recording ? (
        <button onClick={startRecording} style={{ backgroundColor: "#4CAF50", color: "white" }}> 
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} style={{ backgroundColor: "#ff4d4d", color: "white" }}>
          Stop Recording
        </button>
      )}

      {/* Audio Player */}
      {audioURL && <audio controls src={audioURL} style={{ marginLeft: "10px" }} />}

      {/* Upload Button */}
      <button onClick={uploadAudio} disabled={!audioBlob} style={{ backgroundColor: "#dee2e6", color: "black", marginLeft: "10px" }}>
        Upload Transcript
      </button>
      {/* {hasEmotionData && (
        <EmotionGraphs 
          emotionData={emotionData}
        />
      )} */}
      <div className="container mx-auto">
        <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">
            Stress over Time
            </h3>
            <p className="text-sm text-gray-600 mb-1">
            A measure of tension and pressure experienced using speech
            </p>
        </div>
                
        <div 
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer"
        >
            <div 
            id="stress-graph" 
            className="w-full border rounded-lg bg-white p-6 mb-8"
            style={{ minHeight: '350px' }}
            />
        </div>
        <div className="w-full border rounded-lg bg-white p-6">
            {/* <ul className="space-y-2">
                {keyMoments.map((moment, index) => (
                <li key={index} className="flex items-start p-2 border-b last:border-b-0">
                    <span className="font-bold mr-3 text-gray-600">
                    {index + 1}.
                    </span>
                    <span className="text-gray-700">{moment}</span>
                </li>
                ))}
            </ul> */}
            <div className="space-y-2">
                {keyMoments.map((moment, index) => (
                <div key={index} className="flex items-start p-2 border-b last:border-b-0">
                    <span className="font-bold mr-3 text-gray-600">
                    {index + 1}. 
                    </span>
                    <span className="text-gray-700">{moment}</span>
                </div>
                ))}
            </div>
        </div>
    </div>
    </div>

  );
  // return (
  //   <div className="transcript-processing">
  //     <h1>Transcript Processing</h1>
  //     <div className="AudioProcessing">
  //       <img
  //         src="/homepage-image.png" /* Adjust path if using src/assets */
  //         alt="Home"
  //         className="home-logo"
  //         onClick={() => navigate("/")}
  //       />
        
  //     </div>
  //   </div>
  // );
}

export default TranscriptProcessing;
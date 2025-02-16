import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as d3 from 'd3';

const VideoRecorder = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [expanded, setExpanded] = useState(false);

  const [stressScores, setStressScores] = useState([]);
  const [keyMoments, setKeyMoments] = useState([]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const startStream = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints,
        audio: true
      });
      setIsLive(true);
      setError(null);
    } catch (err) {
      setError({
        type: 'camera_error',
        message: 'Camera access denied. Please enable camera permissions.',
        raw: err.message
      });
    }
  };

  const startRecording = () => {
    setRecordedChunks([]);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream);
    
    mediaRecorderRef.current.ondataavailable = ({ data }) => {
      if (data.size > 0) setRecordedChunks(prev => [...prev, data]);
    };
    
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadVideo = async () => {
    try {
      setUploadStatus('uploading');
      setError(null);
      
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');

      const response = await axios.post(
        'http://127.0.0.1:8000/upload_video',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadStatus('success');
    
      console.log('Upload response:', response.data);

      setStressScores(response.data.data.stressScores)
      setKeyMoments(response.data.data.keyMoments)


      
    } catch (err) {
      setUploadStatus('error');
      const errorData = err.response?.data || { message: 'Upload failed' };
      setError({
        type: 'api_error',
        message: errorData.detail || errorData.message,
        status: err.response?.status,
        raw: err.message
      });
    }
  };

//   const keyMoments1 = [
//     "Describing a pleasant day, sun out, lying on grass",
//     "Everything feels good - maintaining relaxed state",
//     "Sudden shift in tone and content",
//     "Witnessing a man being run over",
//     "Expressing shock at the event.",
//     "Focus on the injury (broken leg)",
//     "Strong expression of distress - 'Oh my God'",
//     "Expressing shock",
//     "Witnessing a man being run over again",
//     "Expressing shock"
// ]

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

  // Proper error rendering function
  const renderError = () => {
    if (!error) return null;

    return (
      <div style={{ 
        color: '#dc3545',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f8d7da',
        borderRadius: '4px'
      }}>
        <strong>Error:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          {error.message}
        </div>
        <details style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
          <summary>Technical details</summary>
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            marginTop: '0.5rem',
            color: '#721c24'
          }}>
            {JSON.stringify({
              type: error.type,
              status: error.status,
              raw: error.raw
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Video Recorder</h2>
      
      {/* Camera Preview */}
      <div style={{ 
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '1rem 0',
        aspectRatio: '16/9'
      }}>
        {isLive ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            videoConstraints={videoConstraints}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            Camera preview will appear here
          </div>
        )}
      </div>

      {/* Recorded Video Preview */}
      {recordedChunks.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <h3>Recorded Preview</h3>
          <video
            controls
            style={{ width: '100%', borderRadius: '8px' }}
            src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
          />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {!isLive ? (
          <button
            onClick={startStream}
            style={buttonStyle('#007bff')}
          >
            Start Camera
          </button>
        ) : (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={buttonStyle('#28a745')}
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={buttonStyle('#dc3545')}
              >
                Stop Recording
              </button>
            )}
            
            {recordedChunks.length > 0 && (
              <button
                onClick={uploadVideo}
                disabled={uploadStatus === 'uploading'}
                style={buttonStyle('#ffc107', uploadStatus === 'uploading')}
              >
                {uploadStatus === 'uploading' ? 'Sending...' : 'Send Video'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div style={{ color: '#28a745', marginTop: '1rem' }}>
          Video uploaded successfully!
        </div>
      )}

      {/* Error Display */}
      {renderError()}

      <div className="container mx-auto">
        <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">
            Stress over Time
            </h3>
            <p className="text-sm text-gray-600 mb-1">
            A measure of tension and pressure experienced during speech
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
            <ul className="space-y-2">
                {keyMoments.map((moment, index) => (
                <li key={index} className="flex items-start p-2 border-b last:border-b-0">
                    <span className="font-bold mr-3 text-gray-600">
                    {index + 1}.
                    </span>
                    <span className="text-gray-700">{moment}</span>
                </li>
                ))}
            </ul>
        </div>
    </div>
    </div>
  );
};

const buttonStyle = (color, disabled = false) => ({
  padding: '12px 24px',
  fontSize: '1rem',
  backgroundColor: disabled ? '#6c757d' : color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.7 : 1
});

export default VideoRecorder;


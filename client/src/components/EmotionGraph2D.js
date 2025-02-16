import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as THREE from 'three'


// const testData = {
//   arousal: [1.0, 0.5623, 0.8391, 0.587, 0.6122, 0.3325, 0.1177, 0.4345, 0.956, 0.8919],
//   dominance: [0.9571, 0.5887, 0.7914, 0.5969, 0.597, 0.4325, 0.2521, 0.5236, 0.9302, 0.9012],
//   valence: [0.2811, 0.4389, 0.3126, 0.513, 0.693, 0.346, 0.1785, 0.2195, 0.1624, 0.2003],
//   stress: [0.9495, 0.316, 0.6812, 0.3339, 0.3416, 0.1309, 0.033, 0.2171, 0.8934, 0.7807],
//   three_d: [(0.9571, 0.2811, 1.0), (0.5887, 0.4389, 0.5623), (0.7914, 0.3126, 0.8391), (0.5969, 0.513, 0.587), (0.597, 0.693, 0.6122), (0.4325, 0.346, 0.3325), (0.2521, 0.1785, 0.1177), (0.5236, 0.2195, 0.4345), (0.9302, 0.1624, 0.956), (0.9012, 0.2003, 0.8919)]
// };

const EmotionGraphs = ({emotionData}) => {
  
  // const emotionData = props.emotionData
  console.log(emotionData)
  // console.log(props)
  const [expanded, setExpanded] = useState(false);
  
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
    if (!emotionData) return;
    createGraph('stress-graph', emotionData.stress, 'Stress Level', '#9C27B0');
    
    if (expanded) {
      setTimeout(() => {
        createGraph('arousal-graph', emotionData.arousal, 'Arousal Level', '#2196F3');
        createGraph('dominance-graph', emotionData.dominance, 'Dominance Level', '#4CAF50');
        createGraph('valence-graph', emotionData.valence, 'Valence Level', '#F44336');
      }, 100);
    }
  }, [expanded, emotionData]);

  return (
    <div className="container mx-auto">
      {emotionData?.stress && emotionData.stress.length > 0 && (
        <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">
            Stress over Time
        </h3>
    <p className="text-sm text-gray-600 mb-1">
      A measure of tension and pressure experienced using speech classification
    </p>
        <button onClick={() => setExpanded(!expanded)} className="text-blue-600 hover:text-blue-800 text-sm">
      {expanded ? 'Collapse' : 'Show All Metrics'}
        </button>
    </div>
    )}
   
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

      {expanded && (
  <div className="space-y-8">
    <div>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">Arousal over Time</h3>
        <p className="text-sm text-gray-600">
          The intensity of emotional activation, ranging from calm to excited
        </p>
      </div>
      <div 
        id="arousal-graph" 
        className="w-full border rounded-lg bg-white p-6"
        style={{ minHeight: '350px' }}
      />
    </div>
    
    <div>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">Dominance over Time</h3>
        <p className="text-sm text-gray-600">
          The level of control or influence expressed in speech
        </p>
      </div>
      <div 
        id="dominance-graph" 
        className="w-full border rounded-lg bg-white p-6"
        style={{ minHeight: '350px' }}
      />
    </div>
    
    <div>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">Valence over Time</h3>
        <p className="text-sm text-gray-600">
          The degree of pleasantness or positivity in emotional expression
        </p>
      </div>
      <div 
        id="valence-graph" 
        className="w-full border rounded-lg bg-white p-6"
        style={{ minHeight: '350px' }}
      />
    </div>
  </div>
)}
</div>
  );
};

export default EmotionGraphs;
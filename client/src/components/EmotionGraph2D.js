import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Sample data structure matching your format
const testData = {
    'arousal': [1.0, 0.5623, 0.8391, 0.587, 0.6122, 0.3325, 0.1177, 0.4345, 0.956, 0.8919],
    'dominance': [0.9571, 0.5887, 0.7914, 0.5969, 0.597, 0.4325, 0.2521, 0.5236, 0.9302, 0.9012],
    'valence': [0.2811, 0.4389, 0.3126, 0.513, 0.693, 0.346, 0.1785, 0.2195, 0.1624, 0.2003],
    'stress': [0.9495, 0.316, 0.6812, 0.3339, 0.3416, 0.1309, 0.033, 0.2171, 0.8934, 0.7807],
    'three_d': [(0.9571, 0.2811, 1.0), (0.5887, 0.4389, 0.5623), (0.7914, 0.3126, 0.8391), (0.5969, 0.513, 0.587), (0.597, 0.693, 0.6122), (0.4325, 0.346, 0.3325), (0.2521, 0.1785, 0.1177), (0.5236, 0.2195, 0.4345), (0.9302, 0.1624, 0.956), (0.9012, 0.2003, 0.8919)]}

const EmotionGraphs = ({ data = testData }) => {
  // Function to create a single graph
  const createGraph = (containerId, values, label, color) => {
    // Clear any existing content in the container
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Set up dimensions and margins for the graph
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(`#${containerId}`)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create X scale (time/index)
    const xScale = d3.scaleLinear()
      .domain([0, values.length - 1])  // Input domain: 0 to number of data points
      .range([0, width]);              // Output range: 0 to width of graph

    // Create Y scale (emotion values)
    const yScale = d3.scaleLinear()
      .domain([0, 1])               // Input domain: 0 to 1 for emotion values
      .range([height, 0]);          // Output range: height to 0 (SVG coordinates)

    // Create the line generator
    const line = d3.line()
      .x((d, i) => xScale(i))      // X coordinate based on index
      .y(d => yScale(d))           // Y coordinate based on emotion value
      .curve(d3.curveMonotoneX);   // Use monotone curve for smooth transitions

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
        .attr('fill', 'black')
        .attr('x', width / 2)
        .attr('y', 25)
        .text('Time');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
        .attr('fill', 'black')
        .attr('transform', 'rotate(-90)')
        .attr('y', -30)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text(label);

    // Add the line path
    svg.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    svg.selectAll('circle')
      .data(values)
      .enter()
      .append('circle')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', d => yScale(d))
        .attr('r', 4)
        .attr('fill', color)
        .attr('opacity', 0.7);
  };

  // Effect hook to create/update graphs when data changes
  useEffect(() => {
    if (!data) return;

    // Create each graph with corresponding data
    createGraph('arousal-graph', data.arousal, 'Arousal', '#2196F3');
    createGraph('dominance-graph', data.dominance, 'Dominance', '#4CAF50');
    createGraph('valence-graph', data.valence, 'Valence', '#F44336');
    createGraph('stress-graph', data.stress, 'Stress', '#9C27B0');
  }, [data]); // Dependency array includes data to update when it changes

  // Render the graph containers
  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Arousal over Time</h3>
        <div id="arousal-graph" className="border rounded-lg bg-white p-2" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Dominance over Time</h3>
        <div id="dominance-graph" className="border rounded-lg bg-white p-2" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Valence over Time</h3>
        <div id="valence-graph" className="border rounded-lg bg-white p-2" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Stress over Time</h3>
        <div id="stress-graph" className="border rounded-lg bg-white p-2" />
      </div>
    </div>
  );
};

export default EmotionGraphs;
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

const testData = {
  arousal: [1.0, 0.5623, 0.8391, 0.587, 0.6122, 0.3325, 0.1177, 0.4345, 0.956, 0.8919],
  dominance: [0.9571, 0.5887, 0.7914, 0.5969, 0.597, 0.4325, 0.2521, 0.5236, 0.9302, 0.9012],
  valence: [0.2811, 0.4389, 0.3126, 0.513, 0.693, 0.346, 0.1785, 0.2195, 0.1624, 0.2003],
  stress: [0.9495, 0.316, 0.6812, 0.3339, 0.3416, 0.1309, 0.033, 0.2171, 0.8934, 0.7807]
};

const EmotionGraphs = () => {
  const [expanded, setExpanded] = useState(false);
  
  const createGraph = (containerId, values, label, color) => {
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
    createGraph('stress-graph', testData.stress, 'Stress Level', '#9C27B0');
    
    if (expanded) {
      setTimeout(() => {
        createGraph('arousal-graph', testData.arousal, 'Arousal Level', '#2196F3');
        createGraph('dominance-graph', testData.dominance, 'Dominance Level', '#4CAF50');
        createGraph('valence-graph', testData.valence, 'Valence Level', '#F44336');
      }, 100);
    }
  }, [expanded]);

  return (
    <div className="container mx-auto">
      <h3 className="text-xl font-bold text-center">
        Stress over Time
      </h3>
      <p className="text-sm text-gray-600 text-center mb-4">
        (Click to {expanded ? 'collapse' : 'show all metrics'})
      </p>
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
            <h3 className="text-xl font-bold text-center mb-4">Arousal over Time</h3>
            <div 
              id="arousal-graph" 
              className="w-full border rounded-lg bg-white p-6"
              style={{ minHeight: '350px' }}
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-center mb-4">Dominance over Time</h3>
            <div 
              id="dominance-graph" 
              className="w-full border rounded-lg bg-white p-6"
              style={{ minHeight: '350px' }}
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-center mb-4">Valence over Time</h3>
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
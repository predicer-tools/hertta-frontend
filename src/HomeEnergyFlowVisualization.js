// src/HomeEnergyFlowVisualization.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function HomeEnergyFlowVisualization({ processes }) {
  const svgRef = useRef();

  useEffect(() => {
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const processArray = Object.values(processes).map((process) => ({
      ...process,
      type: 'process', // Add a type to differentiate processes
    }));

    // Assign random positions (since no specific layout is needed)
    const width = 800;
    const height = 600;

    processArray.forEach((process) => {
      process.x = Math.random() * width; // Random x-position
      process.y = Math.random() * height; // Random y-position
    });

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Initialize simulation without links
    const simulation = d3
      .forceSimulation(processArray)
      .force('charge', d3.forceManyBody().strength(-200)) // Spread them out
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Define color scale for processes
    const color = d3.scaleOrdinal().domain(['process']).range(['#69b3a2']);

    function ticked() {
      // Draw nodes (processes)
      const node = svg
        .selectAll('.node')
        .data(processArray)
        .join('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

      node
        .append('circle')
        .attr('r', 20)
        .attr('fill', color('process'));

      // Add process ID as a label
      node
        .append('text')
        .text((d) => d.id) // Display the process ID
        .attr('text-anchor', 'middle')
        .attr('dy', 5);

      // Tooltip (Optional)
      node
        .append('title')
        .text((d) => `${d.id}`);
    }

    // Enable dragging of nodes
    svg
      .selectAll('.node')
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Clean up on unmount
    return () => {
      simulation.stop();
    };
  }, [processes]);

  return <svg ref={svgRef}></svg>;
}

export default HomeEnergyFlowVisualization;

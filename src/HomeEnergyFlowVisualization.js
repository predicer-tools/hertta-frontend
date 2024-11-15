import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function HomeEnergyFlowVisualization({ rooms, onRoomClick }) {
  const svgRef = useRef();

  useEffect(() => {
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const nodeData = rooms
      .filter((room) => room && room.roomId)
      .map((room) => ({
        ...room,
        type: 'room',
        id: room.roomId,
      }));

    // Assign random positions
    const width = 800;
    const height = 600;

    nodeData.forEach((node) => {
      node.x = Math.random() * width;
      node.y = Math.random() * height;
    });

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Define color scale for node types
    const color = d3.scaleOrdinal().domain(['room']).range(['#ffcc00']);

    // Initialize simulation without links
    const simulation = d3
      .forceSimulation(nodeData)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Create tooltip div
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip');

    // Create node elements
    const node = svg
      .selectAll('.node')
      .data(nodeData)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .on('click', function (event, d) {
        if (d.type === 'room') {
          onRoomClick(d);
        }
      })
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 0.9)
          .html(
            `<strong>Room ID:</strong> ${d.id}<br>
             <strong>Max Temp:</strong> ${d.maxTemp} K<br>
             <strong>Min Temp:</strong> ${d.minTemp} K`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
      });

    // Append squares for room nodes with increased size
    node
      .append('rect')
      .attr('width', 80)
      .attr('height', 80)
      .attr('x', -40)
      .attr('y', -40)
      .attr('fill', color('room'));

    // Add labels
    node
      .append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', 5);

    function ticked() {
      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }

    // Drag functions
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
      tooltip.remove(); // Remove the tooltip when unmounting
    };
  }, [rooms, onRoomClick]);

  return <svg ref={svgRef}></svg>;
}

export default HomeEnergyFlowVisualization;

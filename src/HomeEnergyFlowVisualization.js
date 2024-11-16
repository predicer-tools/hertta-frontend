// HomeEnergyFlowVisualization.js

import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import './HomeEnergyFlowVisualization.css'; // Import the CSS file

function HomeEnergyFlowVisualization({ rooms, processes, activeDevices, onRoomClick }) {
  const svgRef = useRef();

  // Function to convert temperature based on unit
  const convertTemperature = useCallback((temperature, unit) => {
    if (isNaN(parseFloat(temperature))) return 'N/A';
    let temp = parseFloat(temperature);
    
    switch (unit) {
      case '°F':
        // Assuming sensor data is in Celsius, convert to Fahrenheit
        temp = (temp * 9/5) + 32;
        return `${temp.toFixed(2)} °F`;
      case '°C':
        // Temperature is already in Celsius, no conversion needed
        return `${temp.toFixed(2)} °C`;
      case 'K':
      case '°K':
        // If unit is Kelvin, convert to Celsius
        temp = temp - 273.15;
        return `${temp.toFixed(2)} °C`;
      default:
        // For any other units, assume Celsius
        return `${temp.toFixed(2)} °C`;
    }
  }, []);

  // Function to get temperature display for room
  const getTemperatureDisplay = useCallback((room) => {
    if (room.sensorState === undefined || room.sensorState === null) return 'N/A';
    const unit = room.sensorUnit || '°C'; // Default to Celsius if unit is missing
    return convertTemperature(room.sensorState, unit);
  }, [convertTemperature]);

  useEffect(() => {
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const nodeData = [];

    // Create room nodes
    const roomNodes = rooms
      .filter((room) => room && room.roomId)
      .map((room, index) => ({
        ...room,
        type: 'room',
        id: room.roomId,
        // Assign initial positions to spread rooms out
        x: (index % 3) * 300 + 150, // Adjust spacing as needed
        y: Math.floor(index / 3) * 300 + 150,
        fx: (index % 3) * 300 + 150, // Fix positions
        fy: Math.floor(index / 3) * 300 + 150,
      }));

    // Create device nodes from processes
    const deviceNodes = Object.values(processes).map((process) => ({
      ...process,
      type: 'device',
      id: process.name,
      roomId: process.topos.find((topo) => topo.sink !== process.name)?.sink,
      status: activeDevices[process.name] ? 'on' : 'off', // Add status based on activeDevices
    }));

    // Combine nodes
    nodeData.push(...roomNodes, ...deviceNodes);

    // Assign dimensions
    const width = 1000;
    const height = 800;

    // Create SVG with responsive design
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define color scales
    const color = d3
      .scaleOrdinal()
      .domain(['room', 'device-on', 'device-off'])
      .range(['#ffcc00', '#4CAF50', '#F44336']); // Yellow for rooms, Green for on, Red for off

    // Create groups for rooms
    const roomGroups = svg
      .selectAll('.room')
      .data(roomNodes)
      .enter()
      .append('g')
      .attr('class', 'room')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .attr('tabindex', 0) // Make room groups focusable
      .attr('role', 'button') // Define role for accessibility
      .attr('aria-label', (d) => `Room ${d.id}, Temperature ${getTemperatureDisplay(d)}`);

    // Draw room squares
    roomGroups
      .append('rect')
      .attr('width', 200) // Increased size
      .attr('height', 200)
      .attr('x', -100)
      .attr('y', -100)
      .attr('fill', color('room'))
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Add room ID labels
    roomGroups
      .append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', -110) // Position above the square
      .attr('class', 'room-label');

    // Add Temperature Labels
    roomGroups
      .append('text')
      .text((d) => {
        const tempDisplay = getTemperatureDisplay(d);
        return `Temp: ${tempDisplay}`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', -90) // Position below the room ID label
      .attr('class', 'room-temperature-label');

    // Create device nodes within rooms
    roomGroups.each(function (room) {
      const devicesInRoom = deviceNodes.filter(
        (device) => device.roomId === room.id
      );

      // Calculate positions for devices within the room
      const devicePositions = calculateDevicePositions(devicesInRoom.length);

      // Create a group for devices within this room
      const deviceGroup = d3
        .select(this)
        .selectAll('.device')
        .data(devicesInRoom)
        .enter()
        .append('g')
        .attr('class', 'device')
        .attr('tabindex', 0) // Make devices focusable
        .attr('role', 'button') // Define role for accessibility
        .attr('aria-label', (d) => `Device ${d.id}, Status ${d.status}`);

      // Position devices at fixed positions within the room square
      deviceGroup
        .append('rect') // Changed from circle to rect
        .attr('width', 60)
        .attr('height', 60)
        .attr('x', (d, i) => devicePositions[i].x - 30) // Center the square
        .attr('y', (d, i) => devicePositions[i].y - 30)
        .attr('fill', (d) => color(`device-${d.status}`)) // Color based on status
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .transition()
        .duration(500)
        .attr('fill', (d) => color(`device-${d.status}`));

      // Add device labels
      deviceGroup
        .append('text')
        .text((d) => d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('x', (d, i) => devicePositions[i].x)
        .attr('y', (d, i) => devicePositions[i].y)
        .attr('class', 'device-label');

      // Add status label inside the square
      deviceGroup
        .append('text')
        .text((d) => `Status: ${d.status}`)
        .attr('text-anchor', 'middle')
        .attr('dy', 25)
        .attr('x', (d, i) => devicePositions[i].x)
        .attr('y', (d, i) => devicePositions[i].y)
        .attr('class', 'device-status-label');
    });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip');

    // Room interactions
    roomGroups
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
             <strong>Max Temp:</strong> ${convertTemperature(d.maxTemp, d.sensorUnit)}<br>
             <strong>Min Temp:</strong> ${convertTemperature(d.minTemp, d.sensorUnit)}`
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

    // Device interactions
    svg
      .selectAll('.device')
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 0.9)
          .html(
            `<strong>Device ID:</strong> ${d.id}<br>
             <strong>Capacity:</strong> ${d.capacity} kW<br>
             <strong>Status:</strong> ${d.status}`
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

    // Add Legend
    const legendData = [
      { label: 'Room', color: color('room') },
      { label: 'Device On', color: color('device-on') },
      { label: 'Device Off', color: color('device-off') },
    ];

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 50)`); // Position the legend

    legendData.forEach((item, index) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${index * 25})`);

      // Rectangle for color
      legendRow
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', item.color);

      // Text label
      legendRow
        .append('text')
        .attr('x', 30)
        .attr('y', 15)
        .text(item.label)
        .attr('class', 'legend-label');
    });

    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
  }, [rooms, processes, activeDevices, onRoomClick, getTemperatureDisplay, convertTemperature]);

  // Function to calculate fixed positions for devices within a room
  function calculateDevicePositions(deviceCount) {
    const positions = [];
    const spacing = 80; // Adjust spacing between devices
    const startX = -80; // Starting x position
    const startY = -80; // Starting y position
    const maxPerRow = 3; // Max devices per row

    for (let i = 0; i < deviceCount; i++) {
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;
      positions.push({
        x: startX + col * spacing,
        y: startY + row * spacing,
      });
    }
    return positions;
  }

  return <svg ref={svgRef}></svg>;
}

export default HomeEnergyFlowVisualization;

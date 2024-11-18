// src/HomeEnergyFlowVisualization.js

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import './HomeEnergyFlowVisualization.css'; // Import the CSS file
import Popup from './Popup'; // Import the Popup component
import electricityPrices from './utils/electricityPrices'; // Import test electricity price data
import { getTestOutsideTemperature } from './utils/outsideTemperature'; // Import the test temperature function

function HomeEnergyFlowVisualization({ rooms, processes, activeDevices, onDeviceClick, userHeatingDevices }) {
  const svgRef = useRef();

  // State for Optimize Button and Control Signals
  const [controlSignalsData, setControlSignalsData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // State for Outside Temperature (without setter)
  const [outsideTemp] = useState(() => {
    return getTestOutsideTemperature(); // Retrieves the test temperature
  });

  // New State for Last Optimized Time
  const [lastOptimized, setLastOptimized] = useState(null); // Initialize as null

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

  // Function to generate or fetch control signals
  const generateControlSignals = useCallback(() => {
    // This function should fetch or compute control signals from backend or other sources
    // For demonstration, we'll generate dummy data

    const generateDummySignals = (deviceId) => {
      const signals = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) { // 24 intervals (6 hours * 4)
        const time = new Date(now.getTime() + i * 15 * 60000); // 15 minutes in ms
        const status = Math.random() > 0.5 ? 'on' : 'off'; // Random on/off
        signals.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status,
        });
      }
      return signals;
    };

    // Filter heating devices from userHeatingDevices
    const heatingDevices = userHeatingDevices.filter(deviceId => processes[deviceId]);

    if (heatingDevices.length === 0) {
      setControlSignalsData(null);
      setIsOptimizing(false);
      return;
    }

    // Generate control signals for each heating device
    const signals = heatingDevices.reduce((acc, deviceId) => {
      acc[deviceId] = generateDummySignals(deviceId);
      return acc;
    }, {});

    setControlSignalsData(signals);
    setIsOptimizing(false);

    // Update Last Optimized Time
    setLastOptimized(new Date()); // Capture the current date and time
  }, [processes, userHeatingDevices]);

  useEffect(() => {
    // Assign dimensions
    const width = 1000;
    const height = 800;

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
        x: (index % 3) * 300 + 200, // Adjust spacing as needed
        y: Math.floor(index / 3) * 300 + 200,
        fx: (index % 3) * 300 + 200, // Fix positions
        fy: Math.floor(index / 3) * 300 + 200,
      }));

    // Create device nodes from processes
    const deviceNodes = Object.values(processes).map((process, index) => ({
      ...process,
      type: 'device',
      id: process.name,
      roomId: process.topos.find((topo) => topo.sink !== process.name)?.sink,
      status: activeDevices[process.name] ? 'on' : 'off', // Add status based on activeDevices
      x: (index % 3) * 300 + 200, // Optional: Assign initial positions if needed
      y: Math.floor(index / 3) * 300 + 200,
    }));

    // Define Electricity Grid Node
    const gridNode = {
      type: 'electricityGrid',
      id: 'Electricity Grid',
      x: 100, // Position outside rooms (left side)
      y: height / 2, // Vertically centered
      fx: 100,
      fy: height / 2,
    };

    // Combine nodes
    nodeData.push(...roomNodes, ...deviceNodes, gridNode);

    // Create SVG with responsive design
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define color scales
    const color = d3
      .scaleOrdinal()
      .domain(['room', 'device-on', 'device-off', 'electricityGrid'])
      .range(['#ffcc00', '#4CAF50', '#F44336', '#2196F3']); // Yellow for rooms, Green for on, Red for off, Blue for grid

    // Removed links connecting Electricity Grid to devices

    // Draw Electricity Grid
    const gridGroup = svg
      .append('g')
      .attr('class', 'electricityGrid')
      .attr('transform', `translate(${gridNode.x}, ${gridNode.y})`)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', `Electricity Grid`)
      .on('click', () => setIsPopupOpen(true)); // Add click handler to open popup

    // Draw grid square
    gridGroup
      .append('rect')
      .attr('width', 100)
      .attr('height', 100)
      .attr('x', -50)
      .attr('y', -50)
      .attr('fill', color('electricityGrid'))
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Add grid label
    gridGroup
      .append('text')
      .text('Electricity Grid')
      .attr('text-anchor', 'middle')
      .attr('dy', 10)
      .attr('class', 'grid-label');

    // Create groups for rooms
    const roomGroups = svg
      .selectAll('.room')
      .data(roomNodes)
      .enter()
      .append('g')
      .attr('class', 'room')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

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
        .attr('aria-label', (d) => `Device ${d.id}, Status ${d.status}`)
        .on('click', function(event, d) {
          event.stopPropagation(); // Prevent triggering parent click events
          onDeviceClick(d); // Call the handler passed from App.js
        });

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

    // Removed Room Interactions

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
      { label: 'Electricity Grid', color: color('electricityGrid') },
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

    // Add Background Rectangle for Temperature Display (Optional)
    svg.append('rect')
      .attr('x', width - 250) // Adjust based on text width
      .attr('y', 20) // Positioning
      .attr('width', 200)
      .attr('height', 40)
      .attr('fill', '#f0f0f0') // Light gray background
      .attr('stroke', '#000') // Black border
      .attr('stroke-width', 1);

    // Determine Text Color Based on Temperature (Optional)
    const tempColor = outsideTemp < 0 ? '#0000FF' : outsideTemp > 25 ? '#FF0000' : '#000000';

    // Add Outside Temperature Display with Dynamic Color
    svg.append('text')
      .attr('x', width - 150) // Center within the rectangle
      .attr('y', 50) // Position vertically centered within the rectangle
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', tempColor) // Dynamic color
      .attr('aria-label', `Outside Temperature is ${outsideTemp} degrees Celsius`) // Accessibility
      .text(`Outside Temperature: ${outsideTemp} °C`);

    // Add Background Rectangle for Last Optimized Display (Optional)
    svg.append('rect')
      .attr('x', width - 250) // Same x as temperature display
      .attr('y', 80) // Positioned below the temperature display
      .attr('width', 200)
      .attr('height', 40)
      .attr('fill', '#f0f0f0') // Light gray background
      .attr('stroke', '#000') // Black border
      .attr('stroke-width', 1);

    // Format Last Optimized Time
    const formattedLastOptimized = lastOptimized
      ? lastOptimized.toLocaleString([], { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : 'N/A';

    // Add Last Optimized Display
    svg.append('text')
      .attr('x', width - 150) // Center within the rectangle
      .attr('y', 110) // Position vertically centered within the rectangle
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#000') // Static color
      .attr('aria-label', `Last Optimized on ${formattedLastOptimized}`) // Accessibility
      .text(`Last Optimized: ${formattedLastOptimized}`);

    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
  }, [rooms, processes, activeDevices, onDeviceClick, getTemperatureDisplay, convertTemperature, outsideTemp, lastOptimized]);

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

  // Handle Optimize Button Click
  const handleOptimizeClick = () => {
    if (userHeatingDevices.length === 0) {
      setControlSignalsData(null);
      return;
    }
    setIsOptimizing(true);
    // Here you can fetch or compute the actual control signals
    // For demonstration, we'll simulate a delay and then generate dummy data
    setTimeout(() => {
      generateControlSignals();
    }, 1000); // Simulate network delay
  };

  return (
    <div className="visualization-container">
      {/* Control Signals Section */}
      <div className="control-signals-section">
        <h2>Control Signals</h2>
        {userHeatingDevices.length === 0 ? (
          <p>No heating devices added yet for optimize.</p>
        ) : (
          controlSignalsData ? (
            Object.entries(controlSignalsData).map(([deviceId, signals]) => (
              <div key={deviceId} className="control-signals-device">
                <h3>{deviceId}</h3>
                <table className="control-signals-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map((signal, index) => (
                      <tr key={index}>
                        <td>{signal.time}</td>
                        <td>{signal.status.toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>No control signals available.</p>
          )
        )}
      </div>

      {/* Optimize Button */}
      <div className="optimize-section">
        <button className="optimize-button" onClick={handleOptimizeClick} disabled={isOptimizing}>
          {isOptimizing ? 'Optimizing...' : 'Optimize'}
        </button>
      </div>

      {/* D3 Visualization SVG */}
      <svg ref={svgRef}></svg>

      {/* Popup for Electricity Prices */}
      {isPopupOpen && (
        <Popup onClose={() => setIsPopupOpen(false)}>
          <h2>Current Electricity Prices</h2>
          <table className="control-signals-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Price ($/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {electricityPrices.map((price, index) => (
                <tr key={index}>
                  <td>{price.time}</td>
                  <td>{price.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setIsPopupOpen(false)}>Close</button>
        </Popup>
      )}
    </div>
  );
}

export default HomeEnergyFlowVisualization;

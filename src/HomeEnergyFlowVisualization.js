// src/HomeEnergyFlowVisualization.js

import React, { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import "./HomeEnergyFlowVisualization.css"; // Import the CSS file
import Popup from "./Popup"; // Import the Popup component
import electricityPrices from "./utils/electricityPrices"; // Import test electricity price data
import { getTestOutsideTemperature } from "./utils/outsideTemperature"; // Import the test temperature function

function HomeEnergyFlowVisualization({
  rooms,
  processes,
  activeDevices,
  onDeviceClick,
  userHeatingDevices,
}) {
  const svgRef = useRef();

  // State for Optimize Button and Control Signals
  const [controlSignalsData, setControlSignalsData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // State for Outside Temperature
  const [outsideTemp] = useState(getTestOutsideTemperature());

  // State for Last Optimized Time
  const [lastOptimized, setLastOptimized] = useState(null);

  // Function to convert temperature based on unit
  const convertTemperature = useCallback((temperature, unit) => {
    if (isNaN(parseFloat(temperature))) return "N/A";
    let temp = parseFloat(temperature);

    switch (unit) {
      case "°F":
        // Assuming sensor data is in Celsius, convert to Fahrenheit
        temp = (temp * 9) / 5 + 32;
        return `${temp.toFixed(2)} °F`;
      case "°C":
        // Temperature is already in Celsius, no conversion needed
        return `${temp.toFixed(2)} °C`;
      case "K":
      case "°K":
        // If unit is Kelvin, convert to Celsius
        temp = temp - 273.15;
        return `${temp.toFixed(2)} °C`;
      default:
        // For any other units, assume Celsius
        return `${temp.toFixed(2)} °C`;
    }
  }, []);

  // Function to get temperature display for room
  const getTemperatureDisplay = useCallback(
    (room) => {
      if (room.sensorState === undefined || room.sensorState === null)
        return "N/A";
      const unit = room.sensorUnit || "°C"; // Default to Celsius if unit is missing
      return convertTemperature(room.sensorState, unit);
    },
    [convertTemperature]
  );

  // Function to generate or fetch control signals
  const generateControlSignals = useCallback(() => {
    // This function should fetch or compute control signals from backend or other sources
    // For demonstration, we'll generate dummy data

    const generateDummySignals = (deviceId) => {
      const signals = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        // 24 intervals (6 hours * 4)
        const time = new Date(now.getTime() + i * 15 * 60000); // 15 minutes in ms
        const status = Math.random() > 0.5 ? "on" : "off"; // Random on/off
        signals.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status,
        });
      }
      return signals;
    };

    // Filter heating devices from userHeatingDevices
    const heatingDevices = userHeatingDevices.filter((deviceId) =>
      processes.hasOwnProperty(deviceId)
    );

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

  // Zoom State
  const [zoomState, setZoomState] = useState(d3.zoomIdentity);

  // Initialize Zoom and Pan only once
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomState(event.transform); // Update zoomState
      });

    svg.call(zoom).call(zoom.transform, zoomState); // Apply persisted zoom

    // Cleanup on unmount
    return () => {
      svg.on(".zoom", null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once

  // Render Visualization
  const renderVisualization = useCallback(() => {
    // Guard Clause: Ensure svgRef.current exists
    if (!svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove(); // Clear previous content

    // Guard Clause: Ensure there are rooms and devices to visualize
    if (rooms.length === 0 || userHeatingDevices.length === 0) {
      return;
    }

    // Define dimensions based on container
    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8; // Maintain aspect ratio

    // Define dynamic grid based on number of rooms
    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);
    const roomWidth = containerWidth / (numCols + 1);
    const roomHeight = containerHeight / (numRows + 1);
    const roomSize = Math.min(roomWidth, roomHeight) * 0.8; // 80% of grid cell

    // Calculate room positions
    const roomData = rooms.map((room, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      return {
        ...room,
        x: (col + 1) * (containerWidth / (numCols + 1)),
        y: (row + 1) * (containerHeight / (numRows + 1)),
      };
    });

    // Define color scales
    const color = d3
      .scaleOrdinal()
      .domain(["room", "device-on", "device-off", "electricityGrid"])
      .range(["#ffcc00", "#4CAF50", "#F44336", "#2196F3"]); // Yellow for rooms, Green for on, Red for off, Blue for grid

    // Draw Electricity Grid
    const gridNode = {
      type: "electricityGrid",
      id: "Electricity Grid",
      x: containerWidth / 2,
      y: containerHeight - 100,
    };

    const gridGroup = svg
      .append("g")
      .attr("class", "electricityGrid")
      .attr("transform", `translate(${gridNode.x}, ${gridNode.y})`)
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", `Electricity Grid`)
      .on("click", () => setIsPopupOpen(true)); // Add click handler to open popup

    gridGroup
      .append("rect")
      .attr("width", 80) // Increased size
      .attr("height", 80)
      .attr("x", -40)
      .attr("y", -40)
      .attr("fill", color("electricityGrid"))
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    gridGroup
      .append("text")
      .text("Electricity Grid")
      .attr("text-anchor", "middle")
      .attr("dy", 50) // Position below the square
      .attr("class", "grid-label")
      .attr("font-size", "16px"); // Increased font size

    // Draw Rooms
    const roomGroups = svg
      .selectAll(".room")
      .data(roomData)
      .enter()
      .append("g")
      .attr("class", "room")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    roomGroups
      .append("rect")
      .attr("width", roomSize)
      .attr("height", roomSize)
      .attr("x", -roomSize / 2)
      .attr("y", -roomSize / 2)
      .attr("fill", color("room"))
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    roomGroups
      .append("text")
      .text((d) => d.roomId)
      .attr("text-anchor", "middle")
      .attr("dy", -roomSize / 2 - 10)
      .attr("class", "room-label")
      .attr("font-size", "22px"); // Increased font size

    roomGroups
      .append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("dy", -roomSize / 2 + 10)
      .attr("class", "room-temperature-label")
      .attr("font-size", "18px"); // Increased font size

    // Draw Devices within Rooms
    roomGroups.each(function (room) {
      const devicesInRoom = Object.values(processes).filter(
        (device) => device.roomId === room.roomId
      );

      if (devicesInRoom.length === 0) return; // Skip if no devices

      const devicePositions = calculateDevicePositions(devicesInRoom.length, roomSize);

      const deviceGroup = d3
        .select(this)
        .selectAll(".device")
        .data(devicesInRoom)
        .enter()
        .append("g")
        .attr("class", "device")
        .attr("transform", (d, i) => `translate(${devicePositions[i].x}, ${devicePositions[i].y})`)
        .attr("tabindex", 0) // Make devices focusable
        .attr("role", "button") // Define role for accessibility
        .attr("aria-label", (d) => `Device ${d.id}, Status ${d.status}`)
        .on("click", (event, d) => {
          event.stopPropagation(); // Prevent triggering room click
          onDeviceClick(d); // Call the handler passed from App.js
        });

      deviceGroup
        .append("rect") // Changed from circle to rect
        .attr("width", 80) // Increased size
        .attr("height", 80)
        .attr("x", -40) // Center the square
        .attr("y", -40)
        .attr("fill", (d) => color(`device-${d.status}`)) // Color based on status
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .attr("rx", 15) // Rounded corners
        .attr("ry", 15)
        .transition()
        .duration(500)
        .attr("fill", (d) => color(`device-${d.status}`));

      // Add device labels
      deviceGroup
        .append("text")
        .text((d) => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", 25) // Adjusted position
        .attr("class", "device-label")
        .attr("font-size", "16px"); // Increased font size

      // Add status label inside the square
      deviceGroup
        .append("text")
        .text((d) => `Status: ${d.status}`)
        .attr("text-anchor", "middle")
        .attr("dy", 45)
        .attr("class", "device-status-label")
        .attr("font-size", "16px"); // Increased font size
    });

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Device interactions
    svg
      .selectAll(".device")
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 0.9)
          .html(
            `<strong>Device ID:</strong> ${d.id}<br>
             <strong>Capacity:</strong> ${d.capacity} kW<br>
             <strong>Status:</strong> ${d.status}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // Add Legend
    const legendData = [
      { label: "Electricity Grid", color: color("electricityGrid") },
      { label: "Room", color: color("room") },
      { label: "Device On", color: color("device-on") },
      { label: "Device Off", color: color("device-off") },
    ];

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${containerWidth - 250}, 50)`); // Adjusted position

    legendData.forEach((item, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 40})`); // Increased spacing

      // Rectangle for color
      legendRow
        .append("rect")
        .attr("width", 30) // Increased size
        .attr("height", 30)
        .attr("fill", item.color);

      // Text label
      legendRow
        .append("text")
        .attr("x", 40)
        .attr("y", 22) // Adjusted for vertical alignment
        .text(item.label)
        .attr("class", "legend-label")
        .attr("font-size", "18px"); // Increased font size
    });

    // Add Background Rectangle for Temperature Display
    svg
      .append("rect")
      .attr("x", 50) // Positioned at top-left
      .attr("y", 20) // Positioning
      .attr("width", 300)
      .attr("height", 80)
      .attr("fill", "#f0f0f0") // Light gray background
      .attr("stroke", "#000") // Black border
      .attr("stroke-width", 2);

    // Determine Text Color Based on Temperature
    const tempColor =
      outsideTemp < 0 ? "#0000FF" : outsideTemp > 25 ? "#FF0000" : "#000000";

    // Add Outside Temperature Display with Dynamic Color
    svg
      .append("text")
      .attr("x", 200) // Center within the rectangle
      .attr("y", 60) // Position vertically centered within the rectangle
      .attr("text-anchor", "middle")
      .attr("font-size", "20px") // Increased font size
      .attr("fill", tempColor) // Dynamic color
      .attr(
        "aria-label",
        `Outside Temperature is ${outsideTemp} degrees Celsius`
      ) // Accessibility
      .text(`Outside Temp: ${outsideTemp} °C`);

    // Add Background Rectangle for Last Optimized Display
    svg
      .append("rect")
      .attr("x", 50) // Same x as temperature display
      .attr("y", 120) // Positioned below the temperature display
      .attr("width", 300)
      .attr("height", 80)
      .attr("fill", "#f0f0f0") // Light gray background
      .attr("stroke", "#000") // Black border
      .attr("stroke-width", 2);

    // Format Last Optimized Time
    const formattedLastOptimized = lastOptimized
      ? lastOptimized.toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    // Add Last Optimized Display
    svg
      .append("text")
      .attr("x", 200) // Center within the rectangle
      .attr("y", 160) // Position vertically centered within the rectangle
      .attr("text-anchor", "middle")
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#000") // Static color
      .attr(
        "aria-label",
        `Last Optimized on ${formattedLastOptimized}`
      ) // Accessibility
      .text(`Last Optimized: ${formattedLastOptimized}`);

    // Note: Zoom and Pan behavior is already initialized in useEffect above
  }, [
    rooms,
    processes,
    onDeviceClick,
    getTemperatureDisplay,
    outsideTemp,
    lastOptimized,
    userHeatingDevices,
  ]); // Removed 'activeDevices' from dependencies as it's not used here

  // Effect to render visualization when dependencies change
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  // Handle Optimize Button Click
  const handleOptimizeClick = useCallback(() => {
    if (userHeatingDevices.length === 0) {
      setControlSignalsData(null);
      return;
    }
    setIsOptimizing(true);
    // Simulate fetching control signals
    setTimeout(() => {
      generateControlSignals();
    }, 1000); // Simulate network delay
  }, [generateControlSignals, userHeatingDevices]);

  // Listen to window resize to re-render visualization
  useEffect(() => {
    const handleResize = () => {
      renderVisualization();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [renderVisualization]);

  return (
    <div className="visualization-container">
      {/* Control Signals Section */}
      <div className="control-signals-section">
        <h2>Control Signals</h2>
        {userHeatingDevices.length === 0 ? (
          <p>No heating devices added yet for optimization.</p>
        ) : controlSignalsData ? (
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
        )}
      </div>

      {/* Optimize Button */}
      <div className="optimize-section">
        <button
          className="optimize-button"
          onClick={handleOptimizeClick}
          disabled={isOptimizing}
        >
          {isOptimizing ? "Optimizing..." : "Optimize"}
        </button>
      </div>

      {/* Conditional Rendering for Rooms and Devices */}
      {rooms.length === 0 || userHeatingDevices.length === 0 ? (
        <p className="no-data-message">
          No rooms or devices added. Please go to the "Input Data" section to add properties of your building.
        </p>
      ) : (
        <div className="svg-container">
          <svg ref={svgRef}></svg>
        </div>
      )}

      {/* Popup for Electricity Prices */}
      {isPopupOpen && (
        <Popup onClose={() => setIsPopupOpen(false)}>
          <div className="popup-content">
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
          </div>
        </Popup>
      )}
    </div>
  );
}

// Helper function to calculate device positions within a room
function calculateDevicePositions(deviceCount, roomSize) {
  const positions = [];
  const radius = roomSize / 2 - 50; // 50px padding from room edges
  const angleStep = (2 * Math.PI) / deviceCount;

  for (let i = 0; i < deviceCount; i++) {
    const angle = i * angleStep;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    positions.push({ x, y });
  }

  return positions;
}

export default HomeEnergyFlowVisualization;

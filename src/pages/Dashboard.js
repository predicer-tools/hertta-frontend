// src/pages/Dashboard.js

import React, { useEffect, useRef, useCallback, useContext, useState } from "react"; // Added useState
import * as d3 from "d3";
import ReactDOM from 'react-dom'; // Import ReactDOM
import HeaterSwitch from '../components/Switch/HeaterSwitch'; // Import HeaterSwitch
import Modal from '../components/Modal/Modal'; // Import Modal
import EditRoomForm from '../forms/EditRoomForm'; // Import EditRoomForm
import styles from "./Dashboard.module.css"; // Import the CSS Module
import DataContext from '../context/DataContext'; // Import DataContext
import ConfigContext from '../context/ConfigContext'; // Import ConfigContext
import WeatherContext from '../context/WeatherContext'; // Import WeatherContext

function Dashboard({ activeDevices, onDeviceClick }) {
  const svgRef = useRef();

  // Access rooms and heaters from DataContext
  const { rooms, heaters, fiElectricityPrices, controlSignals, toggleHeaterEnabled } = useContext(DataContext);

  // Access sensors and devices from ConfigContext
  const { sensors, devices } = useContext(ConfigContext);

  // Access weatherData from WeatherContext
  const { weatherData } = useContext(WeatherContext);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Function to open modal with selected room
  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // Function to format temperature (already in Celsius)
  const formatTemperature = useCallback((temperature) => {
    if (isNaN(parseFloat(temperature))) return "N/A";
    return `${parseFloat(temperature).toFixed(2)} °C`;
  }, []);

  // Function to get temperature display for current sensor state
  const getTemperatureDisplay = useCallback(
    (room) => {
      if (room.sensorState === undefined || room.sensorState === null) return "N/A";
      const unit = room.sensorUnit || "°C";
      return formatTemperature(room.sensorState);
    },
    [formatTemperature]
  );

  // Function to display maxTemp in Celsius
  const getMaxTemperatureDisplay = useCallback(
    (room) => {
      if (room.maxTemp === undefined || room.maxTemp === null) return "N/A";
      return formatTemperature(room.maxTemp);
    },
    [formatTemperature]
  );

  // Function to display minTemp in Celsius
  const getMinTemperatureDisplay = useCallback(
    (room) => {
      if (room.minTemp === undefined || room.minTemp === null) return "N/A";
      return formatTemperature(room.minTemp);
    },
    [formatTemperature]
  );

  // Function to determine the latest electricity price
  const getCurrentElectricityPrice = useCallback(() => {
    if (!fiElectricityPrices || fiElectricityPrices.length === 0) return "N/A";
    // Assuming fiElectricityPrices is sorted by timestamp ascending
    // If not, sort it first
    const sortedPrices = fiElectricityPrices.slice().sort((a, b) => b.timestamp - a.timestamp);
    const latestPrice = sortedPrices[0].price;
    return `${latestPrice.toFixed(2)} snt/kWh`;
  }, [fiElectricityPrices]);

  // Function to get the current control signal for a heater
  const getCurrentControlSignal = useCallback(
    (heaterId) => {
      if (!controlSignals || !controlSignals[heaterId] || controlSignals[heaterId].length === 0) {
        return "N/A";
      }
      return controlSignals[heaterId][0]; // Assuming the first entry is the current hour
    },
    [controlSignals]
  );

  // Function to calculate heater grid layout and sizes
  const calculateHeaterLayout = useCallback((numHeaters, availableWidth, availableHeight) => {
    if (numHeaters === 0) return { heatersPerRow: 0, heaterSize: 0 };

    // Determine heaters per row (as close to square as possible)
    const heatersPerRow = Math.ceil(Math.sqrt(numHeaters));
    const heatersPerCol = Math.ceil(numHeaters / heatersPerRow);

    // Calculate heater size based on available space and number of heaters
    const heaterSpacing = 10; // Spacing between heaters in pixels
    const heaterWidth = (availableWidth - (heatersPerRow + 1) * heaterSpacing) / heatersPerRow;
    const heaterHeight = (availableHeight - (heatersPerCol + 1) * heaterSpacing) / heatersPerCol;
    const heaterSize = Math.min(heaterWidth, heaterHeight);

    // Set a minimum and maximum heater size
    const minHeaterSize = 20; // pixels
    const maxHeaterSize = 60; // pixels

    const finalHeaterSize = Math.max(minHeaterSize, Math.min(heaterSize, maxHeaterSize));

    return { heatersPerRow, heaterSize: finalHeaterSize, heatersPerCol };
  }, []);

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || rooms.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8; // Maintain aspect ratio

    // Calculate grid layout for rooms
    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);

    // Calculate spacing between rooms
    const horizontalSpacing = containerWidth / (numCols + 1);
    const verticalSpacing = containerHeight / (numRows + 1);

    // Calculate room size (ensuring responsiveness)
    const roomSize = Math.min(horizontalSpacing, verticalSpacing) * 0.8; // 80% of spacing

    // Prepare room data with positions
    const roomData = rooms.map((room, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      return {
        ...room,
        x: (col + 1) * horizontalSpacing,
        y: (row + 1) * verticalSpacing,
      };
    });

    // Define color scale
    const color = d3
      .scaleOrdinal()
      .domain(["room", "heater"])
      .range(["#ffcc00", "#4CAF50"]); // Yellow for rooms, Green for heaters

    // Create room groups
    const roomGroups = svg
      .selectAll(".room")
      .data(roomData)
      .enter()
      .append("g")
      .attr("class", "room")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .on("click", (event, d) => openModal(d)) // Add click event to open modal
      .style("cursor", "pointer"); // Change cursor to pointer on hover

    // Draw Rooms
    roomGroups
      .append("rect")
      .attr("width", roomSize)
      .attr("height", roomSize)
      .attr("x", -roomSize / 2)
      .attr("y", -roomSize / 2)
      .attr("fill", color("room"))
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    // Room ID Labels
    roomGroups
      .append("text")
      .text((d) => d.roomId)
      .attr("text-anchor", "middle")
      .attr("dy", -roomSize / 2 - 10)
      .attr("class", styles.roomLabel)
      .attr("font-size", "16px");

    // Current Temperature Labels
    roomGroups
      .append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0) // Center horizontally
      .attr("y", -roomSize / 2 + 20) // Position near top
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "14px")
      .attr("fill", "#000");

    // Max Temperature Labels
    roomGroups
      .append("text")
      .text((d) => `Max: ${getMaxTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle") // Changed from "end" to "middle"
      .attr("x", 0) // Changed from -roomSize / 2 + 10 to 0
      .attr("y", -roomSize / 2 + 40) // Below current temp
      .attr("class", styles.roomMaxTempLabel)
      .attr("font-size", "14px")
      .attr("fill", "#FF0000"); // Red color for Max Temp

    // Min Temperature Labels
    roomGroups
      .append("text")
      .text((d) => `Min: ${getMinTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle") // Changed from "start" to "middle"
      .attr("x", 0) // Changed from roomSize / 2 - 10 to 0
      .attr("y", -roomSize / 2 + 60) // Adjusted Y position to prevent overlap
      .attr("class", styles.roomMinTempLabel)
      .attr("font-size", "14px")
      .attr("fill", "#0000FF"); // Blue color for Min Temp

    // Add Heaters inside Rooms
    roomGroups.each(function (room) {
      const roomHeaters = heaters.filter((heater) => heater.roomId === room.roomId);

      if (roomHeaters.length === 0) return; // No heaters in this room

      const numHeaters = roomHeaters.length;

      // Define available space for heaters (subtracting space for labels)
      const availableWidth = roomSize - 40; // 20px padding on each side
      const availableHeight = roomSize - 80; // Increased to reserve more space for labels

      // Calculate heater layout
      const { heatersPerRow, heaterSize, heatersPerCol } = calculateHeaterLayout(numHeaters, availableWidth, availableHeight);

      // Heater spacing
      const heaterSpacingX = 10; // pixels
      const heaterSpacingY = 10; // pixels

      // Calculate total heater grid size
      const totalHeaterWidth = heatersPerRow * heaterSize + (heatersPerRow - 1) * heaterSpacingX;
      const totalHeaterHeight = heatersPerCol * heaterSize + (heatersPerCol - 1) * heaterSpacingY;

      // Starting positions to center heaters
      const startX = -totalHeaterWidth / 2 + heaterSize / 2;
      const startY = -totalHeaterHeight / 2 + heaterSize / 2;

      // Create heater groups
      const heaterGroup = d3
        .select(this)
        .selectAll(".heater")
        .data(roomHeaters)
        .enter()
        .append("g")
        .attr("class", "heater")
        .attr("transform", (d, i) => {
          const row = Math.floor(i / heatersPerRow);
          const col = i % heatersPerRow;
          const x = startX + col * (heaterSize + heaterSpacingX);
          const y = startY + row * (heaterSize + heaterSpacingY);
          return `translate(${x}, ${y})`;
        })
        .style("cursor", "pointer");

      // Determine Heater Color Based on isEnabled
      heaterGroup
        .append("rect")
        .attr("width", heaterSize)
        .attr("height", heaterSize)
        .attr("x", -heaterSize / 2)
        .attr("y", -heaterSize / 2)
        .attr("fill", (d) => (d.isEnabled ? color("heater") : "#B0B0B0")) // Grey if disabled
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

      // Add Heater ID Label
      heaterGroup
        .append("text")
        .text((d) => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 15) // Position below the heater rectangle
        .attr("class", styles.heaterIdLabel) // Updated class
        .attr("font-size", "12px")
        .attr("fill", (d) => (d.isEnabled ? "#fff" : "#666")); // Darker text if disabled

      // Add Current Control Signal
      heaterGroup
        .append("text")
        .text((d) => {
          const currentSignal = getCurrentControlSignal(d.id);
          return `Status: ${currentSignal}`;
        })
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 30) // Position below the heater rectangle
        .attr("class", styles.heaterStatusLabel) // Updated class
        .attr("font-size", "12px")
        .attr("fill", (d) => (getCurrentControlSignal(d.id) === "ON" ? "#4CAF50" : "#F44336"));

      // Add Heater Toggle Switch using HeaterSwitch component
      heaterGroup
        .append("foreignObject")
        .attr("width", heaterSize * 1.5) // Scale switch size relative to heater
        .attr("height", heaterSize * 0.8)
        .attr("x", -heaterSize * 0.75) // Center horizontally
        .attr("y", heaterSize / 2 + 35) // Position below the control signal
        .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .html(`<div></div>`) // Placeholder for React Switch
        .each(function (d) {
          // Use ReactDOM to render the Switch inside the foreignObject
          ReactDOM.render(
            <HeaterSwitch
              isEnabled={d.isEnabled}
              onToggle={() => toggleHeaterEnabled(d.id)}
              heaterSize={heaterSize}
            />,
            this.firstChild
          );
        });
    });

    // Add Electricity Grid Square
    const addElectricityGridSquare = () => {
      // Determine position for the Electricity Grid square
      // For example, place it at the top-right corner
      const gridSize = 100; // Size of the square
      const margin = 20; // Margin from the edges

      // Current electricity price
      const currentPrice = getCurrentElectricityPrice();

      // Append a group for the electricity grid
      const gridGroup = svg.append("g")
        .attr("class", "electricity-grid")
        .attr("transform", `translate(${containerWidth - margin - gridSize / 2}, ${margin + gridSize / 2})`);

      // Draw the square
      gridGroup.append("rect")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("x", -gridSize / 2)
        .attr("y", -gridSize / 2)
        .attr("fill", "#2196F3") // Blue color for Electricity Grid
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .attr("rx", 10) // Rounded corners
        .attr("ry", 10);

      // Add label
      gridGroup.append("text")
        .text("Electricity Grid")
        .attr("text-anchor", "middle")
        .attr("dy", -10)
        .attr("font-size", "14px")
        .attr("fill", "#fff");

      // Add current price
      gridGroup.append("text")
        .text(`Price: ${currentPrice}`)
        .attr("text-anchor", "middle")
        .attr("dy", 10)
        .attr("font-size", "16px")
        .attr("fill", "#fff");
    };

    // Call the function to add the Electricity Grid square
    addElectricityGridSquare();
  }, [
    rooms,
    heaters,
    getTemperatureDisplay,
    getMaxTemperatureDisplay,
    getMinTemperatureDisplay,
    onDeviceClick,
    fiElectricityPrices,
    getCurrentElectricityPrice,
    controlSignals,
    getCurrentControlSignal,
    toggleHeaterEnabled,
    calculateHeaterLayout
  ]);

  // Effect to render visualization
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Outside Temperature Display */}
      <div className={styles.outsideTempDisplay}>
        Current Outside Temperature:{" "}
        {weatherData && weatherData.currentTemp !== undefined && weatherData.currentTemp !== null
          ? `${weatherData.currentTemp.toFixed(2)} °C`
          : "Loading..."}
      </div>

      {/* Visualization */}
      <div className={styles.svgContainer}>
        <svg ref={svgRef} width="100%" height="100%">
          <g></g>
        </svg>
      </div>

      {/* Modal for Editing Room Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedRoom && (
          <EditRoomForm room={selectedRoom} onClose={closeModal} />
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;

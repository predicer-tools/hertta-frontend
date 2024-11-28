// src/pages/Dashboard.js

import React, { useEffect, useRef, useCallback, useContext, useState } from "react";
import * as d3 from "d3";
import Modal from '../components/Modal/Modal';
import EditRoomForm from '../forms/EditRoomForm';
import EditHeaterForm from '../forms/EditHeaterForm';
import styles from "./Dashboard.module.css";
import DataContext from '../context/DataContext';
import ConfigContext from '../context/ConfigContext';
import WeatherContext from '../context/WeatherContext';
import { WbIncandescent } from '@mui/icons-material'; // Importing a MUI icon
import ReactDOM from 'react-dom'; // Import ReactDOM

function Dashboard({ activeDevices, onDeviceClick }) {
  const svgRef = useRef();

  // Access contexts
  const { rooms, heaters, fiElectricityPrices, controlSignals, toggleHeaterEnabled, updateHeater } = useContext(DataContext);
  const { sensors, devices } = useContext(ConfigContext);
  const { weatherData } = useContext(WeatherContext);

  // State for Room Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // State for Heater Modal
  const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);
  const [selectedHeater, setSelectedHeater] = useState(null);

  // Function to open Room modal with selected room
  const openRoomModal = (room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  // Function to close Room modal
  const closeRoomModal = () => {
    setSelectedRoom(null);
    setIsRoomModalOpen(false);
  };

  // Function to open Heater modal with selected heater
  const openHeaterModal = (heater) => {
    setSelectedHeater(heater);
    setIsHeaterModalOpen(true);
  };

  // Function to close Heater modal
  const closeHeaterModal = () => {
    setSelectedHeater(null);
    setIsHeaterModalOpen(false);
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
      return formatTemperature(room.sensorState);
    },
    [formatTemperature]
  );

  // Function to display maxTemp
  const getMaxTemperatureDisplay = useCallback(
    (room) => {
      if (room.maxTemp === undefined || room.maxTemp === null) return "N/A";
      return formatTemperature(room.maxTemp);
    },
    [formatTemperature]
  );

  // Function to display minTemp
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
    const sortedPrices = fiElectricityPrices.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestPrice = sortedPrices[0].price;
    return `${latestPrice.toFixed(2)} snt/kWh`;
  }, [fiElectricityPrices]);

  // Function to get the current control signal for a heater
  const getCurrentControlSignal = useCallback(
    (heaterId) => {
      if (!controlSignals || !controlSignals[heaterId] || controlSignals[heaterId].length === 0) {
        return "N/A";
      }
      return controlSignals[heaterId][0];
    },
    [controlSignals]
  );

  // Function to calculate heater grid layout and sizes
  const calculateHeaterLayout = useCallback((numHeaters, availableWidth, availableHeight) => {
    if (numHeaters === 0) return { heatersPerRow: 0, heaterSize: 0 };
    const heatersPerRow = Math.min(3, numHeaters); // Max 3 heaters per row
    const heatersPerCol = Math.ceil(numHeaters / heatersPerRow);
    const heaterSpacing = 20; // Increased spacing for larger heaters
    const heaterWidth = (availableWidth - (heatersPerRow + 1) * heaterSpacing) / heatersPerRow;
    const heaterHeight = (availableHeight - (heatersPerCol + 1) * heaterSpacing) / heatersPerCol;
    const heaterSize = Math.min(heaterWidth, heaterHeight);
    const minHeaterSize = 60; // Increased from 20px to 60px
    const maxHeaterSize = 180; // Increased from 60px to 180px
    const finalHeaterSize = Math.max(minHeaterSize, Math.min(heaterSize, maxHeaterSize));
    return { heatersPerRow, heaterSize: finalHeaterSize, heatersPerCol };
  }, []);

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || rooms.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;

    // Define grid parameters
    const gridSize = 120; // Size of the electricity grid
    const gridMargin = 40; // Increased margin for better spacing

    // Define room layout parameters
    const roomsPerRow = 3;
    const roomSize = 360; // Increased size from 120px to 240px
    const roomSpacing = 60; // Increased spacing between rooms

    // Calculate number of rows
    const numRows = Math.ceil(rooms.length / roomsPerRow);

    // Calculate starting position below the grid
    const startY = gridMargin + gridSize + 60; // gridMargin + gridSize + spacing below grid

    // Calculate required SVG height
    const requiredHeight = startY + numRows * (roomSize + roomSpacing) + gridMargin;

    // Define viewBox dimensions
    const viewBoxWidth = containerWidth;
    const viewBoxHeight = requiredHeight;

    // Set the SVG's viewBox
    d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
      .attr("preserveAspectRatio", "xMidYMin meet");

    // Position the electricity grid at the top center
    const gridX = viewBoxWidth / 2;
    const gridY = gridMargin + gridSize / 2;

    const currentPrice = getCurrentElectricityPrice();

    // Draw Electricity Grid
    const gridGroup = svg.append("g")
      .attr("class", "electricityGridGroup")
      .attr("transform", `translate(${gridX}, ${gridY})`);

    gridGroup.append("circle") // Changed to circle for perfect roundness
      .attr("r", gridSize / 1.5)
      .attr("fill", "#ffffff") // White background
      .attr("stroke", "#333333") // Darker border color
      .attr("stroke-width", 4) // Thicker border
      .attr("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"); // Shadow effect

    gridGroup.append("text")
      .text("Electricity Grid")
      .attr("text-anchor", "middle")
      .attr("dy", -10)
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#333");

    gridGroup.append("text")
      .text(`${currentPrice}`)
      .attr("text-anchor", "middle")
      .attr("dy", 25) // Adjusted dy for better spacing
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#333");

    // Arrange rooms in rows of 3
    const roomData = rooms.map((room, index) => {
      const row = Math.floor(index / roomsPerRow);
      const col = index % roomsPerRow;
      const x = (roomSize + roomSpacing) * col + roomSize / 2 + (viewBoxWidth - (roomsPerRow * (roomSize + roomSpacing) - roomSpacing)) / 2;
      const y = startY + row * (roomSize + roomSpacing) + roomSize / 2;
      return {
        ...room,
        x,
        y,
      };
    });

    const color = d3
      .scaleOrdinal()
      .domain(["room", "heater"])
      .range(["#ffcc00", "#4CAF50"]);

    const roomGroups = svg
      .selectAll(".room")
      .data(roomData)
      .enter()
      .append("g")
      .attr("class", "room")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "default"); // Changed cursor to default

    // Draw Rooms
    roomGroups.append("rect")
      .attr("width", roomSize)
      .attr("height", roomSize)
      .attr("x", -roomSize / 2)
      .attr("y", -roomSize / 2)
      .attr("fill", "#ffffff") // White background
      .attr("stroke", "#333333") // Darker border color
      .attr("stroke-width", 4) // Thicker border
      .attr("rx", 15) // Rounded corners
      .attr("ry", 15)
      .attr("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"); // Shadow effect

    // Room ID Labels with Click Handler
    roomGroups.append("text")
      .text(d => d.roomId)
      .attr("text-anchor", "middle")
      .attr("dy", -roomSize / 2 - 20) // Increased dy for better spacing
      .attr("class", styles.roomLabel)
      .attr("font-size", "20px") // Increased font size
      .attr("cursor", "pointer") // Indicate clickable
      .on("click", (event, d) => openRoomModal(d)); // Add click handler

    // Current Temperature Labels
    roomGroups.append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 40) // Adjusted y for larger room
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#000");

    // Add Max and Min Temperature Labels inside the room square
    roomGroups.append("text")
      .text((d) => `Max: ${getMaxTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 80) // Adjusted y for larger room
      .attr("class", styles.roomMaxTempLabel)
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#FF0000"); // Red color for Max Temp

    roomGroups.append("text")
      .text((d) => `Min: ${getMinTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 120) // Adjusted y for larger room
      .attr("class", styles.roomMinTempLabel)
      .attr("font-size", "18px") // Increased font size
      .attr("fill", "#0000FF"); // Blue color for Min Temp

    // Add Heaters inside Rooms
    roomGroups.each(function (room) {
      const roomHeaters = heaters.filter((heater) => heater.roomId === room.roomId);

      if (roomHeaters.length === 0) return;

      const numHeaters = roomHeaters.length;

      // Adjusted availableHeight to accommodate max/min temp labels
      const availableWidth = roomSize - 80; // Increased to accommodate larger heaters
      const availableHeight = roomSize - 160; // Increased to accommodate larger heaters and labels

      const { heatersPerRow, heaterSize, heatersPerCol } = calculateHeaterLayout(numHeaters, availableWidth, availableHeight);

      const heaterSpacingX = 20; // Increased spacing for larger heaters
      const heaterSpacingY = 20; // Increased spacing for larger heaters

      const totalHeaterWidth = heatersPerRow * heaterSize + (heatersPerRow - 1) * heaterSpacingX;
      const totalHeaterHeight = heatersPerCol * heaterSize + (heatersPerCol - 1) * heaterSpacingY;

      const startX = -totalHeaterWidth / 2 + heaterSize / 2;
      const startYHeater = -roomSize / 2 + 160 + heaterSize / 2; // Adjusted startY to account for labels

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
          const y = startYHeater + row * (heaterSize + heaterSpacingY);
          return `translate(${x}, ${y})`;
        })
        .style("cursor", "pointer"); // Indicate clickable

      // Heater Name (Above the Heater) with Click Handler
      heaterGroup.append("text")
        .text((d) => d.name || "Unnamed Heater") // Display default text if name is missing
        .attr("text-anchor", "middle")
        .attr("dy", -heaterSize / 2 - 15) // Positioned above the heater
        .attr("class", styles.heaterIdLabel)
        .attr("font-size", "16px") // Increased font size
        .attr("fill", "#333333")
        .on("click", (event, d) => {
          event.stopPropagation(); // Prevent event bubbling
          openHeaterModal(d);
        }); // Add click handler

      // Heater Rectangle with Click Handler
      heaterGroup.append("rect")
        .attr("width", heaterSize)
        .attr("height", heaterSize)
        .attr("x", -heaterSize / 2)
        .attr("y", -heaterSize / 2)
        .attr("fill", (d) => (d.isEnabled ? color("heater") : "#B0B0B0"))
        .attr("stroke", "#333333") // Darker border color
        .attr("stroke-width", 3) // Thicker border
        .attr("rx", 10) // Rounded corners
        .attr("ry", 10)
        .attr("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))") // Shadow effect
        .on("click", (event, d) => {
          event.stopPropagation(); // Prevent event bubbling
          openHeaterModal(d);
        }); // Add click handler

      // Heater Status Labels
      heaterGroup.append("text")
        .text((d) => {
          const currentSignal = getCurrentControlSignal(d.id);
          return `Status: ${currentSignal}`;
        })
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 30)
        .attr("class", styles.heaterStatusLabel)
        .attr("font-size", "14px") // Increased font size
        .attr("fill", (d) => (getCurrentControlSignal(d.id) === "ON" ? "#4CAF50" : "#F44336"));
    });

  }, [
    rooms,
    heaters,
    getTemperatureDisplay,
    getMaxTemperatureDisplay,
    getMinTemperatureDisplay,
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

      {/* Removed the "Add New Heater" button as per your request */}
      {/* 
      <button onClick={() => openHeaterModal(null)} className={styles.addHeaterButton}>
        Add New Heater
      </button>
      */}

      {/* Visualization */}
      <div className={styles.svgContainer}>
        <svg ref={svgRef} width="100%">
          <g></g>
        </svg>
      </div>

      {/* Modal for Editing Room Details */}
      <Modal isOpen={isRoomModalOpen} onClose={closeRoomModal}>
        {selectedRoom && (
          <EditRoomForm room={selectedRoom} onClose={closeRoomModal} />
        )}
      </Modal>

      {/* Modal for Editing Heater Details */}
      <Modal isOpen={isHeaterModalOpen} onClose={closeHeaterModal}>
        {selectedHeater && (
          <EditHeaterForm heater={selectedHeater} onClose={closeHeaterModal} />
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;

// src/pages/Dashboard.js

import React, { useEffect, useRef, useCallback, useState, useContext } from "react";
import * as d3 from "d3";
import styles from "./Dashboard.module.css"; // Import the CSS Module
import Modal from "../components/Modals/Modal";
import DataContext from '../context/DataContext'; // Import DataContext
import ConfigContext from '../context/ConfigContext'; // Import ConfigContext
import WeatherContext from '../context/WeatherContext'; // Import WeatherContext

function Dashboard({ activeDevices, onDeviceClick }) {
  const svgRef = useRef();

  // Access rooms and heaters from DataContext
  const { rooms, heaters, fiElectricityPrices, controlSignals } = useContext(DataContext);

  // Access sensors and devices from ConfigContext
  const { sensors, devices } = useContext(ConfigContext);

  // Access weatherData from WeatherContext
  const { weatherData } = useContext(WeatherContext);

  // State for Optimize Button and Control Signals
  const [controlSignalsData, setControlSignalsData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for Last Optimized Time
  const [lastOptimized, setLastOptimized] = useState(null);

  // Function to convert temperature based on unit
  const convertTemperature = useCallback((temperature, unit) => {
    if (isNaN(parseFloat(temperature))) return "N/A";
    let temp = parseFloat(temperature);

    switch (unit) {
      case "°F":
        temp = (temp * 9) / 5 + 32;
        return `${temp.toFixed(2)} °F`;
      case "°C":
        return `${temp.toFixed(2)} °C`;
      case "K":
      case "°K":
        temp = temp - 273.15;
        return `${temp.toFixed(2)} °C`;
      default:
        return `${temp.toFixed(2)} °C`;
    }
  }, []);

  // Function to get temperature display for room
  const getTemperatureDisplay = useCallback(
    (room) => {
      if (room.sensorState === undefined || room.sensorState === null) return "N/A";
      const unit = room.sensorUnit || "°C";
      return convertTemperature(room.sensorState, unit);
    },
    [convertTemperature]
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

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || rooms.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8; // Maintain aspect ratio

    // Calculate grid layout
    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);

    // Calculate spacing
    const horizontalSpacing = containerWidth / (numCols + 1);
    const verticalSpacing = containerHeight / (numRows + 1);

    const roomSize = Math.min(horizontalSpacing, verticalSpacing) * 0.8; // Room size based on spacing

    const roomData = rooms.map((room, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      return {
        ...room,
        x: (col + 1) * horizontalSpacing,
        y: (row + 1) * verticalSpacing,
      };
    });

    const color = d3
      .scaleOrdinal()
      .domain(["room", "heater"])
      .range(["#ffcc00", "#4CAF50"]); // Yellow for rooms, Green for heaters

    const roomGroups = svg
      .selectAll(".room")
      .data(roomData)
      .enter()
      .append("g")
      .attr("class", "room")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

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

    // Room Labels
    roomGroups
      .append("text")
      .text((d) => d.roomId)
      .attr("text-anchor", "middle")
      .attr("dy", -roomSize / 2 - 10)
      .attr("class", styles.roomLabel)
      .attr("font-size", "16px");

    // Room Temperature Labels
    roomGroups
      .append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("dy", 0)
      .attr("dominant-baseline", "middle")
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "14px")
      .attr("fill", "#000");

    // Add Heaters inside Rooms
    roomGroups.each(function (room) {
      const roomHeaters = heaters.filter((heater) => heater.roomId === room.roomId);

      if (roomHeaters.length === 0) return; // No heaters in this room

      const numHeaters = roomHeaters.length;
      const heaterSize = roomSize * 0.2; // Size of each heater

      // Calculate grid positions for heaters within the room
      const heatersPerRow = Math.ceil(Math.sqrt(numHeaters));
      const heatersPerCol = Math.ceil(numHeaters / heatersPerRow);
      const heaterSpacingX = heaterSize;
      const heaterSpacingY = heaterSize;

      const offsetX = -((heatersPerRow - 1) * heaterSpacingX) / 2;
      const offsetY = -((heatersPerCol - 1) * heaterSpacingY) / 2;

      const heaterData = roomHeaters.map((heater, index) => {
        const row = Math.floor(index / heatersPerRow);
        const col = index % heatersPerRow;
        return {
          ...heater,
          x: offsetX + col * heaterSpacingX,
          y: offsetY + row * heaterSpacingY,
        };
      });

      const heaterGroup = d3
        .select(this)
        .selectAll(".heater")
        .data(heaterData)
        .enter()
        .append("g")
        .attr("class", "heater")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .on("click", (event, d) => { // Corrected handler
          // Prevent default behavior if necessary
          event.preventDefault();

          // Handle heater click
          if (onDeviceClick) onDeviceClick(d);
        })
        .style("cursor", "pointer");

      heaterGroup
        .append("rect")
        .attr("width", heaterSize)
        .attr("height", heaterSize)
        .attr("x", -heaterSize / 2)
        .attr("y", -heaterSize / 2)
        .attr("fill", color("heater"))
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

      // Add Heater ID Label
      heaterGroup
        .append("text")
        .text((d) => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .attr("font-size", "12px")
        .attr("fill", "#fff");

      // Add Current Control Signal
      heaterGroup
        .append("text")
        .text((d) => {
          const currentSignal = getCurrentControlSignal(d.id);
          return `Status: ${currentSignal}`;
        })
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 15) // Position below the heater rectangle
        .attr("class", currentSignalClass => currentSignalClass === "ON" ? styles.on : styles.off)
        .attr("font-size", "12px")
        .attr("fill", (d) => (getCurrentControlSignal(d.id) === "ON" ? "#4CAF50" : "#F44336"));
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
  }, [rooms, heaters, getTemperatureDisplay, onDeviceClick, fiElectricityPrices, getCurrentElectricityPrice, controlSignals, getCurrentControlSignal]);

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
    </div>
  );
}

export default Dashboard;

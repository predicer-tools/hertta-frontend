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
  const { rooms, heaters } = useContext(DataContext);

  // Access sensors from ConfigContext
  const { sensors } = useContext(ConfigContext);

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

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || rooms.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8; // Maintain aspect ratio

    // Define total visualization area
    const totalArea = containerWidth * containerHeight;

    // Each room should be 1/5 of the total area
    const roomArea = totalArea / 5;
    const roomSize = Math.sqrt(roomArea); // Assuming square rooms

    // Each device should be 1/9 of the room area
    const deviceArea = roomArea / 9;
    const deviceSize = Math.sqrt(deviceArea); // Assuming square devices

    // Determine grid layout
    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);

    // Calculate spacing
    const horizontalSpacing = containerWidth / (numCols + 1);
    const verticalSpacing = containerHeight / (numRows + 1);

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
      .attr("font-size", "22px");

    // Room Temperature Labels
    roomGroups
      .append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("dy", 0)
      .attr("dominant-baseline", "middle")
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "18px")
      .attr("fill", "#000");

    // Add Heaters inside Rooms
    roomGroups.each(function (room) {
      const roomHeaters = heaters.filter((heater) => heater.roomId === room.roomId);

      const heaterGroup = d3
        .select(this)
        .selectAll(".heater")
        .data(roomHeaters)
        .enter()
        .append("g")
        .attr("class", "heater");

      heaterGroup
        .append("rect")
        .attr("width", deviceSize)
        .attr("height", deviceSize)
        .attr("x", -deviceSize / 2)
        .attr("y", -deviceSize / 2)
        .attr("fill", color("heater"))
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

      heaterGroup
        .append("text")
        .text((d) => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", 0)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#fff");
    });
  }, [rooms, heaters, getTemperatureDisplay]);

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

      <div className={styles.svgContainer}>
        <svg ref={svgRef}>
          <g></g>
        </svg>
      </div>
    </div>
  );
}

export default Dashboard;

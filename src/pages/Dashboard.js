// src/pages/Dashboard.js

import React, { useEffect, useRef, useCallback, useContext, useState } from "react";
import * as d3 from "d3";
import ReactDOM from 'react-dom';
import HeaterSwitch from '../components/Switch/HeaterSwitch';
import Modal from '../components/Modal/Modal';
import EditRoomForm from '../forms/EditRoomForm';
import styles from "./Dashboard.module.css";
import DataContext from '../context/DataContext';
import ConfigContext from '../context/ConfigContext';
import WeatherContext from '../context/WeatherContext';

function Dashboard({ activeDevices, onDeviceClick }) {
  const svgRef = useRef();

  // Access contexts
  const { rooms, heaters, fiElectricityPrices, controlSignals, toggleHeaterEnabled } = useContext(DataContext);
  const { sensors, devices } = useContext(ConfigContext);
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
      return controlSignals[heaterId][0];
    },
    [controlSignals]
  );

  // Function to calculate heater grid layout and sizes
  const calculateHeaterLayout = useCallback((numHeaters, availableWidth, availableHeight) => {
    if (numHeaters === 0) return { heatersPerRow: 0, heaterSize: 0 };

    const heatersPerRow = Math.ceil(Math.sqrt(numHeaters));
    const heatersPerCol = Math.ceil(numHeaters / heatersPerRow);

    const heaterSpacing = 10;
    const heaterWidth = (availableWidth - (heatersPerRow + 1) * heaterSpacing) / heatersPerRow;
    const heaterHeight = (availableHeight - (heatersPerCol + 1) * heaterSpacing) / heatersPerCol;
    const heaterSize = Math.min(heaterWidth, heaterHeight);

    const minHeaterSize = 20;
    const maxHeaterSize = 60;

    const finalHeaterSize = Math.max(minHeaterSize, Math.min(heaterSize, maxHeaterSize));

    return { heatersPerRow, heaterSize: finalHeaterSize, heatersPerCol };
  }, []);

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || rooms.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8;

    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);

    const horizontalSpacing = containerWidth / (numCols + 1);
    const verticalSpacing = containerHeight / (numRows + 1);

    const roomSize = Math.min(horizontalSpacing, verticalSpacing) * 0.8;

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
      .range(["#ffcc00", "#4CAF50"]);

    const roomGroups = svg
      .selectAll(".room")
      .data(roomData)
      .enter()
      .append("g")
      .attr("class", "room")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .on("click", (event, d) => openModal(d))
      .style("cursor", "pointer");

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
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 20)
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "14px")
      .attr("fill", "#000");

    // Add Max and Min Temperature Labels inside the room square
    roomGroups
      .append("text")
      .text((d) => `Max: ${getMaxTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 40)
      .attr("class", styles.roomMaxTempLabel)
      .attr("font-size", "14px")
      .attr("fill", "#FF0000"); // Red color for Max Temp

    roomGroups
      .append("text")
      .text((d) => `Min: ${getMinTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", -roomSize / 2 + 60)
      .attr("class", styles.roomMinTempLabel)
      .attr("font-size", "14px")
      .attr("fill", "#0000FF"); // Blue color for Min Temp

    // Add Heaters inside Rooms
    roomGroups.each(function (room) {
      const roomHeaters = heaters.filter((heater) => heater.roomId === room.roomId);

      if (roomHeaters.length === 0) return;

      const numHeaters = roomHeaters.length;

      // Adjusted availableHeight to accommodate max/min temp labels
      const availableWidth = roomSize - 40;
      const availableHeight = roomSize - 100;

      const { heatersPerRow, heaterSize, heatersPerCol } = calculateHeaterLayout(numHeaters, availableWidth, availableHeight);

      const heaterSpacingX = 10;
      const heaterSpacingY = 10;

      const totalHeaterWidth = heatersPerRow * heaterSize + (heatersPerRow - 1) * heaterSpacingX;
      const totalHeaterHeight = heatersPerCol * heaterSize + (heatersPerCol - 1) * heaterSpacingY;

      const startX = -totalHeaterWidth / 2 + heaterSize / 2;
      const startY = -roomSize / 2 + 80 + heaterSize / 2; // Adjusted startY to account for labels

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

      heaterGroup
        .append("rect")
        .attr("width", heaterSize)
        .attr("height", heaterSize)
        .attr("x", -heaterSize / 2)
        .attr("y", -heaterSize / 2)
        .attr("fill", (d) => (d.isEnabled ? color("heater") : "#B0B0B0"))
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

      heaterGroup
        .append("text")
        .text((d) => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 15)
        .attr("class", styles.heaterIdLabel)
        .attr("font-size", "12px")
        .attr("fill", (d) => (d.isEnabled ? "#fff" : "#666"));

      heaterGroup
        .append("text")
        .text((d) => {
          const currentSignal = getCurrentControlSignal(d.id);
          return `Status: ${currentSignal}`;
        })
        .attr("text-anchor", "middle")
        .attr("dy", heaterSize / 2 + 30)
        .attr("class", styles.heaterStatusLabel)
        .attr("font-size", "12px")
        .attr("fill", (d) => (getCurrentControlSignal(d.id) === "ON" ? "#4CAF50" : "#F44336"));

      heaterGroup
        .append("foreignObject")
        .attr("width", heaterSize * 1.5)
        .attr("height", heaterSize * 0.8)
        .attr("x", -heaterSize * 0.75)
        .attr("y", heaterSize / 2 + 35)
        .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .html(`<div></div>`)
        .each(function (d) {
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
      const gridSize = 100;
      const margin = 20;

      const currentPrice = getCurrentElectricityPrice();

      const gridGroup = svg.append("g")
        .attr("class", "electricity-grid")
        .attr("transform", `translate(${containerWidth - margin - gridSize / 2}, ${margin + gridSize / 2})`);

      gridGroup.append("rect")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("x", -gridSize / 2)
        .attr("y", -gridSize / 2)
        .attr("fill", "#2196F3")
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

      gridGroup.append("text")
        .text("Electricity Grid")
        .attr("text-anchor", "middle")
        .attr("dy", -10)
        .attr("font-size", "14px")
        .attr("fill", "#fff");

      gridGroup.append("text")
        .text(`Price: ${currentPrice}`)
        .attr("text-anchor", "middle")
        .attr("dy", 10)
        .attr("font-size", "16px")
        .attr("fill", "#fff");
    };

    addElectricityGridSquare();
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

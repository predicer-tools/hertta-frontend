// src/pages/Dashboard.js

import React, { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import styles from "./Dashboard.module.css"; // Import the CSS Module
import Modal from '../components/modals/Modal';


function Dashboard({
  rooms,
  activeDevices,
  onDeviceClick,
  userHeatingDevices,
  outsideTemp,
}) {
  const svgRef = useRef();

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
      if (room.sensorState === undefined || room.sensorState === null)
        return "N/A";
      const unit = room.sensorUnit || "°C";
      return convertTemperature(room.sensorState, unit);
    },
    [convertTemperature]
  );

  // Function to generate control signals
  const generateControlSignals = useCallback(() => {
    const generateDummySignals = (deviceId) => {
      const signals = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() + i * 15 * 60000);
        const status = Math.random() > 0.5 ? "on" : "off";
        signals.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status,
        });
      }
      return signals;
    };

    const signals = userHeatingDevices.reduce((acc, deviceId) => {
      acc[deviceId] = generateDummySignals(deviceId);
      return acc;
    }, {});

    setControlSignalsData(signals);
    setIsOptimizing(false);

    setLastOptimized(new Date());
  }, [userHeatingDevices]);

  // Render Visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    if (rooms.length === 0 || userHeatingDevices.length === 0) return;

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = containerWidth * 0.8;

    const numRooms = rooms.length;
    const numCols = Math.ceil(Math.sqrt(numRooms));
    const numRows = Math.ceil(numRooms / numCols);
    const roomWidth = containerWidth / (numCols + 1);
    const roomHeight = containerHeight / (numRows + 1);
    const roomSize = Math.min(roomWidth, roomHeight) * 0.8;

    const roomData = rooms.map((room, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      return {
        ...room,
        x: (col + 1) * (containerWidth / (numCols + 1)),
        y: (row + 1) * (containerHeight / (numRows + 1)),
      };
    });

    const color = d3
      .scaleOrdinal()
      .domain(["room", "device-on", "device-off", "electricityGrid"])
      .range(["#ffcc00", "#4CAF50", "#F44336", "#2196F3"]);

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
      .attr("class", styles.roomLabel)
      .attr("font-size", "22px");

    roomGroups
      .append("text")
      .text((d) => `Temp: ${getTemperatureDisplay(d)}`)
      .attr("text-anchor", "middle")
      .attr("dy", 0)
      .attr("dominant-baseline", "middle")
      .attr("class", styles.roomTemperatureLabel)
      .attr("font-size", "18px")
      .attr("fill", "#000");
  }, [rooms, userHeatingDevices, getTemperatureDisplay]);

  // Effect to render visualization
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.controlSignalsSection}>
        <h2>Control Signals</h2>
        {controlSignalsData ? (
          Object.entries(controlSignalsData).map(([deviceId, signals]) => (
            <div key={deviceId} className={styles.controlSignalsDevice}>
              <h3>{deviceId}</h3>
              <table className={styles.controlSignalsTable}>
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

      <button
        className={styles.optimizeButton}
        onClick={() => setIsModalOpen(true)}
      >
        Show Modal
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Modal Content</h2>
        <p>Some information goes here!</p>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default Dashboard;

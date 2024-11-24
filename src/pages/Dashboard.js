import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import styles from "./Dashboard.module.css"; // Import the CSS Module
import Modal from "../components/modals/Modal";

function Dashboard() {
  const svgRef = useRef();

  // States for rooms and heating devices
  const [rooms, setRooms] = useState([]);
  const [heatingDevices, setHeatingDevices] = useState([]);
  const [controlSignalsData, setControlSignalsData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load rooms and heating devices from localStorage
  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem("rooms")) || [];
    const storedDevices = JSON.parse(localStorage.getItem("heaters")) || [];
    setRooms(storedRooms);
    setHeatingDevices(storedDevices);
  }, []);

  // Function to get devices associated with a room
  const getDevicesInRoom = useCallback(
    (roomId) => heatingDevices.filter((device) => device.roomId === roomId),
    [heatingDevices]
  );

  // Function to generate control signals for heating devices
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

    const signals = heatingDevices.reduce((acc, device) => {
      acc[device.id] = generateDummySignals(device.id);
      return acc;
    }, {});

    setControlSignalsData(signals);
  }, [heatingDevices]);

  // Render visualization for rooms and devices
  const renderVisualization = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current).select("g");
    svg.selectAll("*").remove();

    if (rooms.length === 0 || heatingDevices.length === 0) return;

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
      const devices = getDevicesInRoom(room.roomId);
      return {
        ...room,
        x: (col + 1) * (containerWidth / (numCols + 1)),
        y: (row + 1) * (containerHeight / (numRows + 1)),
        devices,
      };
    });

    const color = d3
      .scaleOrdinal()
      .domain(["room", "device-on", "device-off"])
      .range(["#ffcc00", "#4CAF50", "#F44336"]);

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
      .text((d) => `Devices: ${d.devices.length}`)
      .attr("text-anchor", "middle")
      .attr("dy", 0)
      .attr("dominant-baseline", "middle")
      .attr("class", styles.deviceCountLabel)
      .attr("font-size", "18px")
      .attr("fill", "#000");
  }, [rooms, heatingDevices, getDevicesInRoom]);

  // Effect to render visualization
  useEffect(() => {
    renderVisualization();
  }, [renderVisualization]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.visualizationContainer}>
        <svg ref={svgRef} width="100%" height="500">
          <g />
        </svg>
      </div>

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
        className={styles.generateSignalsButton}
        onClick={generateControlSignals}
      >
        Generate Control Signals
      </button>

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

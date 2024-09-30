// src/VisualizationGraph.js
import React from 'react';
import './VisualizationGraph.css';

const VisualizationGraph = ({ rooms, processes }) => {
  // Create a mapping from rooms to heaters based on processes and topologies
  const roomHeaterMap = {};

  // Iterate over the processes to build the mapping
  Object.values(processes).forEach((process) => {
    if (process.topos && process.topos.length > 0) {
      process.topos.forEach((topo) => {
        if (topo.source === process.id && topo.sink) {
          // This is an output topology from the heater to a node (possibly a room)
          const roomId = topo.sink;
          if (!roomHeaterMap[roomId]) {
            roomHeaterMap[roomId] = [];
          }
          roomHeaterMap[roomId].push(process);
        }
      });
    }
  });

  return (
    <svg width="800" height="600">
      {/* Draw the house outline */}
      <rect x="150" y="100" width="500" height="400" stroke="black" fill="none" strokeWidth="2" />
      {/* Draw the roof */}
      <polygon points="150,100 400,20 650,100" stroke="black" fill="none" strokeWidth="2" />

      {/* Draw the electricitygrid node outside the house */}
      <circle cx="50" cy="300" r="30" fill="yellow" stroke="black" strokeWidth="2" />
      <text x="50" y="300" textAnchor="middle" dy="5" fontSize="12">Electricity Grid</text>

      {/* Place rooms inside the house */}
      {rooms.map((room, index) => {
        const roomWidth = 200;
        const roomHeight = 150;
        const cols = 2; // Number of columns to arrange rooms
        const x = 170 + (index % cols) * (roomWidth + 20);
        const y = 120 + Math.floor(index / cols) * (roomHeight + 20);

        return (
          <g key={room.roomId || room.name}>
            <rect
              x={x}
              y={y}
              width={roomWidth}
              height={roomHeight}
              fill="#f0f0f0"
              stroke="black"
            />
            <text x={x + roomWidth / 2} y={y + 20} textAnchor="middle" fontWeight="bold">
              {room.roomId || room.name}
            </text>
            {/* Display devices in the room */}
            {roomHeaterMap[room.roomId]?.map((heater, idx) => (
              <text
                key={heater.id}
                x={x + 20}
                y={y + 40 + idx * 20}
                fontSize="14"
              >
                🔥 {heater.name || 'Electric Heater'}
              </text>
            ))}
          </g>
        );
      })}

      {/* Draw connections from electricitygrid to heaters */}
      {Object.values(processes).map((process) => {
        // For each process, find the input topology from electricitygrid
        const inputTopo = process.topos?.find(topo => topo.source === 'electricitygrid' && topo.sink === process.id);

        if (inputTopo) {
          // Find the room the heater is in
          const outputTopo = process.topos?.find(topo => topo.source === process.id);

          const roomId = outputTopo?.sink;
          const roomIndex = rooms.findIndex(room => room.roomId === roomId);

          if (roomIndex !== -1) {
            const roomWidth = 200;
            const roomHeight = 150;
            const cols = 2;
            const x = 170 + (roomIndex % cols) * (roomWidth + 20);
            const y = 120 + Math.floor(roomIndex / cols) * (roomHeight + 20);

            // Draw a line from electricitygrid to the room
            return (
              <line
                key={`${process.id}-connection`}
                x1="80"
                y1="300"
                x2={x + roomWidth / 2}
                y2={y + roomHeight / 2}
                stroke="blue"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            );
          }
        }
        return null;
      })}

      {/* Define arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="blue" />
        </marker>
      </defs>
    </svg>
  );
};

export default VisualizationGraph;

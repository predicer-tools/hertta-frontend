// RoomPropertiesPopup.js
import React, { useState, useEffect } from 'react';
import './Popup.css'; // Create this CSS file for styling

function RoomPropertiesPopup({ roomData, isOpen, onClose, onSave }) {
  const [room, setRoom] = useState(roomData);

  useEffect(() => {
    setRoom(roomData);
  }, [roomData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prevRoom) => ({
      ...prevRoom,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(room);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Edit Room Properties</h2>
        <div className="input-group">
          <label>Room ID:</label>
          <input
            type="text"
            name="roomId"
            value={room.roomId}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>Room Width (m):</label>
          <input
            type="number"
            name="roomWidth"
            value={room.roomWidth}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>Room Length (m):</label>
          <input
            type="number"
            name="roomLength"
            value={room.roomLength}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>Max Temp (K):</label>
          <input
            type="number"
            name="maxTemp"
            value={room.maxTemp}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>Min Temp (K):</label>
          <input
            type="number"
            name="minTemp"
            value={room.minTemp}
            onChange={handleChange}
          />
        </div>
        {/* Add other properties as needed */}
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default RoomPropertiesPopup;

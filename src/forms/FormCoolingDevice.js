import React, { useContext, useState } from 'react';
import DataContext from '../context/DataContext';
import './DataForm.css';

function FormCoolingDevice({ fetchedDevices = [], onClose }) {
  const { rooms, heaters, heatPumps, coolingDevices, addCoolingDevice } =
    useContext(DataContext);
  const [deviceId, setDeviceId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [electricalCapacity, setElectricalCapacity] = useState('');
  const [coolingCop, setCoolingCop] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const capacity = Number(electricalCapacity);
    const cop = Number(coolingCop);
    if (!deviceId || !roomId || !capacity || !cop) {
      setError('Please fill in all required fields.');
      return;
    }
    if (capacity <= 0 || cop <= 0) {
      setError('Electrical capacity and cooling COP must be greater than 0.');
      return;
    }
    if ([...heaters, ...heatPumps, ...coolingDevices].some((device) => device.id === deviceId)) {
      setError('This device has already been added.');
      return;
    }

    const selectedDevice = fetchedDevices.find((device) => device.entity_id === deviceId);
    setIsSaving(true);
    try {
      await addCoolingDevice({
        id: deviceId,
        name: selectedDevice?.attributes?.friendly_name || deviceId,
        roomId,
        electricalCapacity: capacity,
        coolingCop: cop,
        isEnabled: true,
      });
      if (onClose) onClose();
    } catch (submitError) {
      setError(submitError.message || 'Could not create cooling device model.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="device-form">
      <h3>Add Cooling Device</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="coolingDevice">Home Assistant Device:</label>
          <select
            id="coolingDevice"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            required
          >
            <option value="">Select a Home Assistant device</option>
            {fetchedDevices.map((device) => (
              <option key={device.entity_id} value={device.entity_id}>
                {device.attributes?.friendly_name || device.entity_id}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="coolingDeviceRoom">Room:</label>
          <select
            id="coolingDeviceRoom"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            required
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>{room.roomId}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="coolingDeviceElectricalCapacity">Electrical Input Capacity (kW):</label>
          <input
            id="coolingDeviceElectricalCapacity"
            type="number"
            min="0.01"
            step="0.01"
            value={electricalCapacity}
            onChange={(event) => setElectricalCapacity(event.target.value)}
            placeholder="0.97"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="coolingDeviceCop">Cooling COP:</label>
          <input
            id="coolingDeviceCop"
            type="number"
            min="0.1"
            step="0.01"
            value={coolingCop}
            onChange={(event) => setCoolingCop(event.target.value)}
            placeholder="2.68"
            required
          />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Adding...' : 'Add Cooling Device'}
        </button>
      </form>
    </div>
  );
}

export default FormCoolingDevice;

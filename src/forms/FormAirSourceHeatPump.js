import React, { useContext, useState } from 'react';
import DataContext from '../context/DataContext';
import './DataForm.css';

function FormAirSourceHeatPump({ fetchedDevices = [], onClose }) {
  const { rooms, heatPumps, heaters, addAirSourceHeatPump } = useContext(DataContext);
  const [deviceId, setDeviceId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [electricalCapacity, setElectricalCapacity] = useState('');
  const [heatingCop, setHeatingCop] = useState('');
  const [coolingCop, setCoolingCop] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const capacity = Number(electricalCapacity);
    const heatCop = Number(heatingCop);
    const coolCop = Number(coolingCop);
    if (!deviceId || !roomId || !capacity || !heatCop || !coolCop) {
      setError('Please fill in all required fields.');
      return;
    }
    if (capacity <= 0 || heatCop <= 0 || coolCop <= 0) {
      setError('Capacity and COP values must be greater than 0.');
      return;
    }
    if ([...heaters, ...heatPumps].some((device) => device.id === deviceId)) {
      setError('This device has already been added.');
      return;
    }

    const selectedDevice = fetchedDevices.find((device) => device.entity_id === deviceId);
    setIsSaving(true);
    try {
      await addAirSourceHeatPump({
        id: deviceId,
        name: selectedDevice?.attributes?.friendly_name || deviceId,
        roomId,
        electricalCapacity: capacity,
        heatingCop: heatCop,
        coolingCop: coolCop,
        isEnabled: true,
      });
      if (onClose) onClose();
    } catch (submitError) {
      setError(submitError.message || 'Could not create air-source heat pump model.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="device-form">
      <h3>Add Air-Source Heat Pump</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="heatPumpDevice">Home Assistant Device:</label>
          <select
            id="heatPumpDevice"
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
          <label htmlFor="heatPumpRoom">Room:</label>
          <select
            id="heatPumpRoom"
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
          <label htmlFor="heatPumpElectricalCapacity">Electrical Input Capacity (kW):</label>
          <input
            id="heatPumpElectricalCapacity"
            type="number"
            min="0.1"
            step="0.1"
            value={electricalCapacity}
            onChange={(event) => setElectricalCapacity(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="heatingCop">Heating COP:</label>
          <input
            id="heatingCop"
            type="number"
            min="0.1"
            step="0.1"
            value={heatingCop}
            onChange={(event) => setHeatingCop(event.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="coolingCop">Cooling COP:</label>
          <input
            id="coolingCop"
            type="number"
            min="0.1"
            step="0.1"
            value={coolingCop}
            onChange={(event) => setCoolingCop(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Adding...' : 'Add Air-Source Heat Pump'}
        </button>
      </form>
    </div>
  );
}

export default FormAirSourceHeatPump;

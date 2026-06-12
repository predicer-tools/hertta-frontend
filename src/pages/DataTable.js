// src/pages/DataTable.js

import React, { useEffect, useState, useContext } from 'react';
import styles from './DataTable.module.css'; // Import CSS Module
import DataContext from '../context/DataContext'; // Import DataContext
import 'react-tooltip/dist/react-tooltip.css'; // Import react-tooltip styles
import Modal from '../components/Modal/Modal'; // Import Modal
import EditHeaterForm from '../forms/EditHeaterForm'; // Import EditHeaterForm
import EditRoomForm from '../forms/EditRoomForm'; // Import EditRoomForm
import useWeatherData from '../hooks/useWeatherData';
import WeatherDataTable from '../components/Table/WeatherDataTable';
import ElectricityPricesTable from '../components/Table/ElectricityPricesTable';
import ConfigContext from '../context/ConfigContext';


function DataTable() {
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);

  const { rooms, heaters, heatPumps, coolingDevices, deleteRoom, deleteHeater, deleteAirSourceHeatPump, deleteCoolingDevice, controlSignals, controlSignalTimes, fiPrices, fiPricesLoading, fiPricesError  } = useContext(DataContext); // Access rooms and heaters from DataContext
  const { getLocation } = useContext(ConfigContext);
  const location = getLocation();
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(location);


  // State for Heater Edit Modal
  const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);
  const [selectedHeater, setSelectedHeater] = useState(null);

  // State for Room Edit Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);


  // Load sensors and devices from localStorage on mount
  useEffect(() => {
    const storedSensors = JSON.parse(localStorage.getItem('homeAssistantSensors')) || [];
    const storedDevices = JSON.parse(localStorage.getItem('fetchedDevices')) || [];
    setSensors(storedSensors);
    setDevices(storedDevices);
  }, []);

  // Function to format temperature
  const formatTemperature = (temp) => (temp === null || temp === undefined ? 'N/A' : `${temp.toFixed(2)} °C`);

  const formatControlSignalTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const controlSignalColumns = [
    ...heaters.map((heater) => ({
      key: heater.id,
      label: heater.name || heater.id,
    })),
    ...heatPumps.flatMap((heatPump) => [
      {
        key: `${heatPump.id}_heating`,
        label: `${heatPump.name || heatPump.id} Heating`,
      },
      {
        key: `${heatPump.id}_cooling`,
        label: `${heatPump.name || heatPump.id} Cooling`,
      },
    ]),
    ...coolingDevices.map((coolingDevice) => ({
      key: `${coolingDevice.id}_cooling`,
      label: `${coolingDevice.name || coolingDevice.id} Cooling`,
    })),
  ];

  const controlSignalRowCount = Math.max(
    controlSignalTimes.length,
    ...controlSignalColumns.map((column) =>
      Array.isArray(controlSignals[column.key]) ? controlSignals[column.key].length : 0
    )
  );

  // Modal handling functions for Heaters
  const openHeaterEditModal = (heater) => {
    setSelectedHeater(heater);
    setIsHeaterModalOpen(true);
  };

  const closeHeaterEditModal = () => {
    setSelectedHeater(null);
    setIsHeaterModalOpen(false);
  };

  // Modal handling functions for Rooms
  const openRoomEditModal = (room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const closeRoomEditModal = () => {
    setSelectedRoom(null);
    setIsRoomModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <h2>Data Table</h2>

            {/* Rooms Table */}
            <h3>Rooms</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room Width (m)</th>
              <th>Room Length (m)</th>
              <th>Max Temp (°C)</th>
              <th>Min Temp (°C)</th>
              <th>Sensor ID</th>
              <th>Sensor State</th>
              <th>Outside Walls</th>
              <th>Ceiling Outside</th>
              <th>Floor to Soil</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? rooms.map((room, index) => (
              <tr key={index}>
                <td>{room.roomId}</td>
                <td>{room.roomWidth}</td>
                <td>{room.roomLength}</td>
                <td>{formatTemperature(room.maxTemp)}</td>
                <td>{formatTemperature(room.minTemp)}</td>
                <td>{room.sensorId}</td>
                <td>
                  {room.sensorState} {room.sensorUnit}
                </td>
                <td>
                  {Object.values(room.outsideWalls ?? {}).filter(Boolean).length}
                </td>
                <td>{room.ceilingToOutside ? 'Yes' : 'No'}</td>
                <td>{room.floorToSoil ? 'Yes' : 'No'}</td>
                <td>
                  <button className={styles.editButton} onClick={() => openRoomEditModal(room)}>Edit</button>
                  <button className={styles.deleteButton} onClick={() => deleteRoom(room.roomId)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="11">No rooms available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      {/* Heating Devices Table */}
      <h3>Heating Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Heater ID</th>
              <th>Name</th>
              <th>Capacity (kW)</th>
              <th>Heating COP</th>
              <th>Cooling COP</th>
              <th>Room</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {heaters.length > 0 ? heaters.map((heater, index) => {
              // Find the associated room's name
              const associatedRoom = rooms.find(room => room.roomId === heater.roomId);
              const roomName = associatedRoom ? associatedRoom.roomId : 'Unassigned';

              return (
                <tr key={index}>
                  <td>{heater.id}</td>
                  <td>{heater.name}</td>
                  <td>{heater.capacity.toFixed(2)} kW</td>
                  <td>{Number(heater.heatingCop ?? 1).toFixed(2)}</td>
                  <td>{heater.coolingCop !== undefined ? Number(heater.coolingCop).toFixed(2) : '-'}</td>
                  <td>{roomName}</td>
                  <td>{heater.isEnabled ? 'Enabled' : 'Disabled'}</td>
                  <td>
                    <button className={styles.editButton} onClick={() => openHeaterEditModal(heater)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => deleteHeater(heater.id)}>Delete</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="8">No heating devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3>Air-Source Heat Pumps</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Climate Entity</th>
              <th>Room</th>
              <th>Electrical Capacity (kW)</th>
              <th>Heating COP</th>
              <th>Cooling COP</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {heatPumps.length > 0 ? heatPumps.map((heatPump) => (
              <tr key={heatPump.id}>
                <td>{heatPump.name}</td>
                <td>{heatPump.id}</td>
                <td>{heatPump.roomId}</td>
                <td>{heatPump.electricalCapacity.toFixed(2)}</td>
                <td>{heatPump.heatingCop.toFixed(2)}</td>
                <td>{heatPump.coolingCop.toFixed(2)}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteAirSourceHeatPump(heatPump.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7">No air-source heat pumps available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3>Cooling Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Home Assistant Entity</th>
              <th>Room</th>
              <th>Electrical Capacity (kW)</th>
              <th>Cooling Capacity (kW)</th>
              <th>Cooling COP</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {coolingDevices.length > 0 ? coolingDevices.map((coolingDevice) => (
              <tr key={coolingDevice.id}>
                <td>{coolingDevice.name}</td>
                <td>{coolingDevice.id}</td>
                <td>{coolingDevice.roomId}</td>
                <td>{Number(coolingDevice.electricalCapacity).toFixed(2)}</td>
                <td>
                  {(Number(coolingDevice.electricalCapacity) * Number(coolingDevice.coolingCop)).toFixed(2)}
                </td>
                <td>{Number(coolingDevice.coolingCop).toFixed(2)}</td>
                <td>{coolingDevice.isEnabled === false ? 'Disabled' : 'Enabled'}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteCoolingDevice(coolingDevice.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8">No cooling devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    {/* Control Signals Table */}
    <h3>Control Signals</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Timestamp</th>
            {controlSignalColumns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {controlSignalColumns.length > 0 && controlSignalRowCount > 0 ? (
            Array.from({ length: controlSignalRowCount }, (_, index) => (
              <tr key={controlSignalTimes[index] || index}>
                <td>{formatControlSignalTime(controlSignalTimes[index])}</td>
                {controlSignalColumns.map((column) => {
                  const signals = controlSignals[column.key];
                  const signal = Array.isArray(signals) ? signals[index] : undefined;
                  return <td key={column.key}>{signal ?? '-'}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Math.max(controlSignalColumns.length + 1, 1)}>No control signals available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <ElectricityPricesTable
      fiPrices={fiPrices}
      loading={fiPricesLoading}
      error={fiPricesError}
    />

      <div>
      <h1>Weather App</h1>
      <WeatherDataTable weatherData={weatherData} />
    </div>

      {/* Sensors Table */}
      <h3>Home Assistant Sensors</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sensor ID</th>
              <th>State</th>
              <th>Friendly Name</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {sensors.length > 0 ? sensors.map((sensor, index) => (
              <tr key={index}>
                <td>{sensor.entity_id}</td>
                <td>{sensor.state}</td>
                <td>{sensor.attributes?.friendly_name || 'Unknown'}</td>
                <td>{sensor.attributes?.unit_of_measurement || ''}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4">No Home Assistant sensors available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Devices Table */}
      <h3>All Home Assistant Devices</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>State</th>
              <th>Friendly Name</th>
              <th>Domain</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? devices.map((device, index) => (
              <tr key={index}>
                <td>{device.entity_id}</td>
                <td>{device.state}</td>
                <td>{device.attributes?.friendly_name || 'Unknown'}</td>
                <td>{device.entity_id.split('.')[0]}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4">No other devices available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Heaters Edit Modal */}
      <Modal isOpen={isHeaterModalOpen} onClose={closeHeaterEditModal}>
        {selectedHeater && <EditHeaterForm heater={selectedHeater} onClose={closeHeaterEditModal} />}
      </Modal>

      {/* Rooms Edit Modal */}
      <Modal isOpen={isRoomModalOpen} onClose={closeRoomEditModal}>
        {selectedRoom && <EditRoomForm room={selectedRoom} onClose={closeRoomEditModal} />}
      </Modal>
    </div>
  );
}

export default DataTable;

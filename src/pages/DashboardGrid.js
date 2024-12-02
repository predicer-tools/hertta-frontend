// src/components/DashboardGrid.js

import React, { useContext, useState } from 'react';
import Grid2 from '@mui/material/Grid2';
import DataContext from '../context/DataContext';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit'; 
import IconButton from '@mui/material/IconButton';
import Modal from '../components/Modal/Modal'; 
import EditRoomForm from '../forms/EditRoomForm';
import EditElectricHeaterForm from '../forms/EditHeaterForm';
import ClickableHeater from '../components/Objects/ClickableHeater';
import Typography from '@mui/material/Typography';
import ElectricityPricesTable from '../components/Table/ElectricityPricesTable';

function DashboardGrid() {
    const {
        rooms,
        heaters,

        updateRoom,
        updateElectricHeater,

        fiPrices,
        fiPricesLoading,
        fiPricesError,
        currentFiElectricityPrice,

    } = useContext(DataContext);

    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);
    const [selectedHeater, setSelectedHeater] = useState(null);

    const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);

    const handleOpenRoomModal = (room) => {
      setSelectedRoom(room);
      setIsRoomModalOpen(true);
    };

    const handleCloseRoomModal = () => {
        setSelectedRoom(null);
        setIsRoomModalOpen(false);
    };

    const handleOpenHeaterModal = (heater) => {
        setSelectedHeater(heater);
        setIsHeaterModalOpen(true);
    };

    const handleCloseHeaterModal = () => {
        setSelectedHeater(null);
        setIsHeaterModalOpen(false);
    };

    // Handlers for Electricity Prices Modal
    const handleOpenElectricityModal = () => {
      setIsElectricityModalOpen(true);
    };
  
    const handleCloseElectricityModal = () => {
        setIsElectricityModalOpen(false);
    };

    // Extract the first electricity price entry
    const firstFiPrice = fiPrices && fiPrices.length > 0 ? fiPrices[0] : null;

    if (!rooms || rooms.length === 0) {
        return <div>No rooms available.</div>;
    }

    return (
        <>
            <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <Paper
                      sx={{ padding: 2, cursor: 'pointer' }}
                      onClick={handleOpenElectricityModal}
                      aria-label="View Electricity Prices"
                  >
                      <Typography variant="h5" component="h2">
                          Electricity Grid Information
                      </Typography>
                      {/* Display the First Electricity Price as Current Price */}
                      {firstFiPrice ? (
                          <Typography variant="body1">
                              Current Price: {firstFiPrice.price} snt/kWh from{' '}
                              {new Date(firstFiPrice.start).toLocaleTimeString()} to{' '}
                              {new Date(firstFiPrice.end).toLocaleTimeString()}
                          </Typography>
                      ) : (
                          <Typography variant="body1">
                              No current electricity price data available.
                          </Typography>
                      )}
                    </Paper>
                </Grid2>
                {rooms.map((room) => (
                    <Grid2 xs={6} key={room.roomId}>
                        <div
                            style={{
                                border: '1px solid #ccc',
                                padding: '16px',
                                position: 'relative', // Positioning context for the IconButton
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                minHeight: '200px',
                            }}
                        >
                            {/* Edit Icon Button */}
                            <IconButton
                                aria-label={`Edit ${room.roomId}`}
                                onClick={() => handleOpenRoomModal(room)}
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    zIndex: 1, // Ensure the button is above other elements
                                }}
                            >
                                <EditIcon />
                            </IconButton>

                            <h2>{room.roomId}</h2>
                            <p>Max Temp: {room.maxTemp} °C</p>
                            <p>Min Temp: {room.minTemp} °C</p>
                            <p>Sensor ID: {room.sensorId}</p>
                            <Grid2 container spacing={1}>
                                {heaters
                                    .filter((heater) => heater.roomId === room.roomId)
                                    .map((heater) => (
                                        <Grid2 xs={4} key={heater.id}>
                                            <ClickableHeater
                                                heater={heater}
                                                onClick={handleOpenHeaterModal}
                                            />
                                        </Grid2>
                                    ))}
                            </Grid2>
                        </div>
                    </Grid2>
                ))}
            </Grid2>

            {/* Modal for Editing Room */}
            <Modal isOpen={isRoomModalOpen} onClose={handleCloseRoomModal}>
              {selectedRoom && <EditRoomForm room={selectedRoom} onClose={handleCloseRoomModal} />}
            </Modal>

            {/* Modal for Editing Electric Heater */}
            <Modal isOpen={isHeaterModalOpen} onClose={handleCloseHeaterModal}>
                {selectedHeater && (
                    <EditElectricHeaterForm
                        heater={selectedHeater}
                        onClose={handleCloseHeaterModal}
                        rooms={rooms}
                    />
                )}
            </Modal>

            {/* Modal for Electricity Prices Table */}
            <Modal isOpen={isElectricityModalOpen} onClose={handleCloseElectricityModal}>
              <Typography variant="h6" component="h3" gutterBottom>
                  Electricity Prices
              </Typography>
              <ElectricityPricesTable
                  fiPrices={fiPrices}
                  loading={fiPricesLoading}
                  error={fiPricesError}
              />
            </Modal>
        </>
    );
}

export default DashboardGrid;

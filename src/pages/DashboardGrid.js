// src/components/DashboardGrid.js

import React, { useContext, useState } from 'react';
import Grid2 from '@mui/material/Grid2';
import DataContext from '../context/DataContext';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit'; 
import IconButton from '@mui/material/IconButton';
import Modal from '../components/Modal/Modal'; 
import EditRoomForm from '../forms/EditRoomForm';

function DashboardGrid() {
    const {
        rooms,
        heaters,
        fiElectricityPrices,
        loadingFiPrices,
        errorFiPrices,
        currentFiElectricityPrice,
    } = useContext(DataContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const handleOpenModal = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRoom(null);
        setIsModalOpen(false);
    };

    const now = new Date();

    if (!rooms || rooms.length === 0) {
        return <div>No rooms available.</div>;
    }

    // Handle loading and error states for electricity prices
    if (loadingFiPrices) {
        return <div>Loading electricity prices...</div>;
    }

    if (errorFiPrices) {
        return <div>Error loading electricity prices: {errorFiPrices}</div>;
    }

    return (
        <>
            <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                    <Paper sx={{ padding: 2 }}>
                        <h2>Electricity Grid Information</h2>
                        {currentFiElectricityPrice ? (
                            <p>
                                Current Price: {currentFiElectricityPrice.price} snt/kWh from{' '}
                                {currentFiElectricityPrice.date.toLocaleTimeString()} to{' '}
                                {new Date(currentFiElectricityPrice.date.getTime() + 3600000).toLocaleTimeString()}
                            </p>
                        ) : (
                            <p>No current electricity price data available.</p>
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
                                onClick={() => handleOpenModal(room)}
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
                                            <div style={{ border: '1px solid #aaa', padding: '8px' }}>
                                                <h4>{heater.name}</h4>
                                                <p>Status: {heater.isEnabled ? 'Enabled' : 'Disabled'}</p>
                                            </div>
                                        </Grid2>
                                    ))}
                            </Grid2>
                        </div>
                    </Grid2>
                ))}
            </Grid2>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {selectedRoom && <EditRoomForm room={selectedRoom} onClose={handleCloseModal} />}
            </Modal>
        </>
    );
}

export default DashboardGrid;

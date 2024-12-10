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
import ClickablePaper from '../components/Objects/ClickablePaper';
import Typography from '@mui/material/Typography';
import WeatherDataTable from '../components/Table/WeatherDataTable';
import Tooltip from '@mui/material/Tooltip';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ElectricityPricesTable from '../components/Table/ElectricityPricesTable';
import Box from '@mui/material/Box';
import { getCurrentTempLimits } from '../utils/tempUtils';
import Switch from '@mui/material/Switch';



function DashboardGrid() {
    const {
        rooms,
        heaters,

        updateRoom,
        updateElectricHeater,
        toggleHeaterEnabled,

        fiPrices,
        fiPricesLoading,
        fiPricesError,

        weatherData,
        weatherLoading,
        weatherError,
        currentWeather,

        controlSignals, // Access control signals
        optimizeStarted,
        startOptimization, // Use startOptimization from DataContext
        stopOptimization,
        lastOptimizedTime,

    } = useContext(DataContext);

    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [isHeaterModalOpen, setIsHeaterModalOpen] = useState(false);
    const [selectedHeater, setSelectedHeater] = useState(null);

    const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);

    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);


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

    // Handlers for Weather Modal
    const handleOpenWeatherModal = () => {
      setIsWeatherModalOpen(true);
    };

    const handleCloseWeatherModal = () => {
      setIsWeatherModalOpen(false);
    };

    // Extract the first electricity price entry
    const firstFiPrice = fiPrices && fiPrices.length > 0 ? fiPrices[0] : null;

    if (!rooms || rooms.length === 0) {
        return <div>No rooms available.</div>;
    }

    return (
        <>
            {/* Outer Paper with Light Blue Background */}
            <Paper
                sx={{
                    padding: 4,
                    backgroundColor: '#e3f2fd', // Light blue color
                    minHeight: '100vh', // Ensures it covers the full viewport height
                }}
                elevation={3}
            >
                <Grid2 container spacing={4} direction="column">
                    {/* Title */}
                    <Grid2 xs={12}>
                        <Typography variant="h4" component="h1" align="center" gutterBottom>
                            Home Energy Dashboard
                        </Typography>
                    </Grid2>

                    <Grid2 xs={12} sx={{ textAlign: 'center', marginBottom: 4 }}>
                        <button
                            onClick={startOptimization}
                            disabled={optimizeStarted}
                        >
                            {optimizeStarted ? 'Optimization Active' : 'Start Optimize'}
                        </button>

                        {optimizeStarted && (
                            <button
                            onClick={stopOptimization}
                            style={{ marginLeft: '10px' }}
                            >
                            Stop Optimization
                            </button>
                        )}

                        {lastOptimizedTime && (
                            <Typography variant="body2" sx={{ marginTop: 2 }}>
                            Last Optimized: {new Date(lastOptimizedTime).toLocaleString()}
                            </Typography>
                        )}
                    </Grid2>


                    {/* Side-by-Side Sections: Outside-Paper and Electricity Grid Paper */}
                    <Grid2 container spacing={2}>
                        {/* Outside-Paper */}
                        <Grid2 xs={12} md={6}>
                          <Tooltip title="Click to view detailed weather information" arrow>
                            <ClickablePaper
                              onClick={handleOpenWeatherModal}
                              ariaLabel="View Weather Information"
                              disabled={weatherLoading && !weatherData} // Disable if loading and no data
                            >
                              <div className="header">
                                <Typography variant="h5" component="h2" gutterBottom>
                                  Outside <WbSunnyIcon fontSize="small" />
                                </Typography>
                              </div>
                              <div className="content">
                                {weatherLoading ? (
                                  <CircularProgress size={24} />
                                ) : weatherError ? (
                                  <Typography variant="body1" color="error">
                                    Failed to load weather data.
                                  </Typography>
                                ) : weatherData ? (
                                  <Typography variant="body1">
                                    Temperature: {currentWeather.value}°C
                                  </Typography>
                                ) : (
                                  <Typography variant="body1">
                                    No weather data available.
                                  </Typography>
                                )}
                              </div>
                            </ClickablePaper>
                          </Tooltip>
                        </Grid2>

                        {/* Electricity Grid Information */}
                        <Grid2 xs={12} md={6}>
                        <Paper
                            sx={{ 
                            padding: 2, 
                            cursor: 'pointer', 
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto', // Allow scrolling if content overflows
                            }}
                            onClick={handleOpenElectricityModal}
                            aria-label="View Electricity Prices"
                            elevation={2}
                        >
                            <Typography variant="h5" component="h2" gutterBottom>
                            Electricity Grid
                            </Typography>
                            {/* Current Electricity Price */}
                            {firstFiPrice ? (
                            <Typography variant="body1" gutterBottom>
                                <strong>Current Price:</strong> {firstFiPrice.finalPrice} c/kWh at {firstFiPrice.timestampLocal}
                            </Typography>
                            ) : (
                            <Typography variant="body1" gutterBottom>
                                No current electricity price data available.
                            </Typography>
                            )}
                        </Paper>
                        </Grid2>
                    </Grid2>

                    {/* Rooms */}
                    <Grid2 container spacing={2}>
                        {rooms.map((room) => (
                            <Grid2 xs={12} sm={6} md={4} key={room.roomId}>
                                <Paper
                                    sx={{
                                        padding: 2,
                                        position: 'relative',
                                        borderRadius: '8px',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                        minHeight: '250px',
                                    }}
                                    elevation={2}
                                >
                                    {/* Edit Icon Button */}
                                    <IconButton
                                        aria-label={`Edit ${room.roomId}`}
                                        onClick={() => handleOpenRoomModal(room)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            zIndex: 1, // Ensure the button is above other elements
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                            },
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>

                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {room.roomId}
                                    </Typography>
                                    {/* Current Hour Temperature Limits */}
                                <Box
                                    sx={{
                                        marginTop: 2,
                                        padding: 1,
                                        borderRadius: '4px',
                                        backgroundColor: '#f5f5f5', // Light grey background for consistency
                                        color: '#333', // Dark text for readability
                                    }}
                                >
                                    <Typography variant="subtitle1">
                                        <strong>Current temperature limits:</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Max:</strong> {getCurrentTempLimits(room).maxTemp} °C
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Min:</strong> {getCurrentTempLimits(room).minTemp} °C
                                    </Typography>
                                </Box>

                                    <Typography variant="body1">
                                        <strong>Sensor ID:</strong> {room.sensorId}
                                    </Typography>
                                    <Grid2 container spacing={1} sx={{ marginTop: 2 }}>
                                        {heaters
                                            .filter((heater) => heater.roomId === room.roomId)
                                            .map((heater) => (
                                            <Grid2 xs={12} key={heater.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ClickableHeater heater={heater} onClick={() => handleOpenHeaterModal(heater)} />
                                                <Switch
                                                checked={heater.isEnabled}
                                                onChange={() => toggleHeaterEnabled(heater.id)}
                                                inputProps={{ 'aria-label': 'Enable Optimization' }}
                                                />
                                                <Typography variant="body2" sx={{ marginLeft: 1 }}>
                                                {heater.isEnabled ? 'Optimized' : 'Not Optimized'}
                                                </Typography>
                                            </Grid2>
                                        ))}
                                    </Grid2>
                                </Paper>
                            </Grid2>
                        ))}
                    </Grid2>
                </Grid2>
            </Paper>

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
            <ElectricityPricesTable />
            </Modal>

            {/* Modal for Weather Data */}
            <Modal isOpen={isWeatherModalOpen} onClose={handleCloseWeatherModal}>
            <Typography variant="h6" component="h3" gutterBottom>
                Weather Information
            </Typography>
            {/* Pass the weatherData prop here */}
            <WeatherDataTable weatherData={weatherData} />
            </Modal>
        </>
    ); // Closing parenthesis for the return block
} // Closing curly brace for the function

export default DashboardGrid;

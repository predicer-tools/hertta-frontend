// src/components/RoomContent.js

import React from 'react';
import { Grid2, Typography } from '@mui/material';
import HeaterSwitch from './Switch/HeaterSwitch';
import PropTypes from 'prop-types';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

function RoomContent({ heaters, toggleHeaterEnabled }) {
  return (
    <Grid2 container spacing={1} justifyContent="center" alignItems="center">
      {heaters.map((heater) => (
        <Grid2 key={heater.id} xs={6} sm={4} md={3}>
          <Grid2 container direction="column" alignItems="center">
            {/* Heater Icon */}
            <ElectricBoltIcon
              color={heater.isEnabled ? 'primary' : 'disabled'}
              fontSize="large"
            />
            
            {/* Heater ID */}
            <Typography variant="caption" component="div">
              {heater.id}
            </Typography>
            
            {/* Heater Switch */}
            <HeaterSwitch
              isEnabled={heater.isEnabled}
              onToggle={() => toggleHeaterEnabled(heater.id)}
            />
          </Grid2>
        </Grid2>
      ))}
    </Grid2>
  );
}

RoomContent.propTypes = {
  heaters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      isEnabled: PropTypes.bool.isRequired,
    })
  ).isRequired,
  toggleHeaterEnabled: PropTypes.func.isRequired,
};

export default RoomContent;

// src/components/Table/ElectricityPricesTable.js

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

/**
 * ElectricityPricesTable Component
 *
 * Displays a table of electricity prices.
 *
 * @param {Object} props
 * @param {Array} props.fiPrices - Array of electricity price objects.
 * @param {boolean} props.loading - Indicates if data is being loaded.
 * @param {string|null} props.error - Error message if data fetching fails.
 *
 * @returns {JSX.Element}
 */
const ElectricityPricesTable = ({ fiPrices, loading, error }) => {
  if (loading) {
    return <Typography variant="body1">Loading electricity prices...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="body1" color="error">
        Error loading electricity prices: {error}
      </Typography>
    );
  }

  if (!Array.isArray(fiPrices) || fiPrices.length === 0) {
    return <Typography variant="body1">No electricity price data available.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="Electricity Prices Table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Time Slot</strong></TableCell>
            <TableCell align="right"><strong>Price (snt/kWh)</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fiPrices.map((priceEntry, index) => {
            // Validate individual priceEntry structure
            if (!priceEntry.start || !priceEntry.end || typeof priceEntry.price !== 'number') {
              return (
                <TableRow key={index}>
                  <TableCell colSpan="2" align="center">
                    Invalid data format.
                  </TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {new Date(priceEntry.start).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })} -{' '}
                  {new Date(priceEntry.end).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </TableCell>
                <TableCell align="right">{priceEntry.price}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ElectricityPricesTable.propTypes = {
  fiPrices: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

ElectricityPricesTable.defaultProps = {
  fiPrices: [],
  error: null,
};

export default ElectricityPricesTable;

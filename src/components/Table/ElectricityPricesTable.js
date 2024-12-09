// src/components/Table/ElectricityPricesTable.js

import React, { useContext } from 'react';
import DataContext from '../../context/DataContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const ElectricityPricesTable = () => {
  const { fiPrices, fiPricesLoading, fiPricesError } = useContext(DataContext);

  if (fiPricesLoading) {
    return <CircularProgress />;
  }

  if (fiPricesError) {
    return <Alert severity="error">Error: {fiPricesError}</Alert>;
  }

  if (!fiPrices || fiPrices.length === 0) {
    return <Typography>No electricity price data available.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="Electricity Prices Table">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp (Finnish Time)</TableCell>
            <TableCell align="right">Final Price (c/kWh)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fiPrices.map((price, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {price.timestampLocal}
              </TableCell>
              <TableCell align="right">{price.finalPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ElectricityPricesTable;

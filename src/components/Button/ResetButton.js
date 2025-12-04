// src/components/ResetButton/ResetButton.js

import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import DataContext from '../../context/DataContext';
import ConfigContext from '../../context/ConfigContext';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  resetButton: {
   
  },
});

// Snackbar Alert Component
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ResetButton() {
  const classes = useStyles();
  const { resetData } = useContext(DataContext);
  const { resetConfig } = useContext(ConfigContext);

  const [open, setOpen] = useState(false);

  const handleReset = () => {
    // Confirmation prompt
    if (
      window.confirm(
        "Are you sure you want to reset all data? This action cannot be undone."
      )
    ) {
      // Reset both DataContext and ConfigContext
      resetData();
      resetConfig();

      // Open Snackbar for feedback
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleReset}
        className={classes.resetButton}
        sx={{ margin: 2 }}
      >
        Reset All Data
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          All data has been reset successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default ResetButton;

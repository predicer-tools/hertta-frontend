// SendInputData.js

import React from 'react';
import buildingData from './building.json'; // Import the building.json file

function SendInputData({ jsonContent }) {
  const sendBuildingDataToBackend = async () => {
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        fetch_weather_data: 'false',
        fetch_elec_data: 'false',
        fetch_time_data: 'false',
        country: 'FI',
        location: 'Hervanta',
        timezone: '', // Empty timezone
      });

      const response = await fetch(`http://127.0.0.1:3030/api/optimize?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildingData), // Use buildingData as the body
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from backend (building data):', data);
      // Handle the response as needed, e.g., store job ID or show a message
    } catch (error) {
      console.error('Error sending building data to backend:', error);
    }
  };

  const sendGeneratedDataToBackend = async () => {
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        fetch_weather_data: 'false',
        fetch_elec_data: 'false',
        fetch_time_data: 'false',
        country: 'FI',
        location: 'Hervanta',
        timezone: '', // Empty timezone
      });

      const response = await fetch(`http://127.0.0.1:3030/api/optimize?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonContent), // Use generated jsonContent as the body
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from backend (generated data):', data);
      // Handle the response as needed, e.g., store job ID or show a message
    } catch (error) {
      console.error('Error sending generated data to backend:', error);
    }
  };

  return (
    <div>
      <button onClick={sendBuildingDataToBackend}>SEND BUILDING DATA TO SERVER</button>
      <button onClick={sendGeneratedDataToBackend}>SEND GENERATED DATA TO SERVER</button>
    </div>
  );
}

export default SendInputData;

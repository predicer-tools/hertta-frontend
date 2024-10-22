// src/ElectricHeaterControl.js

// Function to control the electric heater (lamp)
export const controlElectricHeater = async (entityId, action, apiKey) => {
    try {
      const response = await fetch('http://localhost:8123/api/services/light/' + action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,  // Include API Key in the headers
        },
        body: JSON.stringify({
          entity_id: entityId,  // Entity ID of the electric heater or lamp
        }),
      });
  
      const data = await response.json();
      console.log(`Heater control (${action}) response:`, data);
    } catch (error) {
      console.error(`Error controlling heater (${action}):`, error);
    }
  };
  
  // Function to trigger time-series control of the heater (lamp)
  export const triggerTimeSeriesControl = async (entityId) => {
    try {
      const response = await fetch('http://localhost:5000/api/time-series-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: entityId, // Entity ID of the electric heater or lamp
        }),
      });
  
      const data = await response.json();
      console.log('Time-series control response:', data);
    } catch (error) {
      console.error('Error in time-series control:', error);
    }
  };
  
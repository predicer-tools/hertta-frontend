import axios from 'axios';

const homeAssistantURL = 'http://localhost:8123/api'; // Mock server URL

// Function to fetch sensor data from Home Assistant
export const fetchSensorsFromHomeAssistant = async (apiKey) => {
  try {
    console.log('Sending GET request to Home Assistant with API key:', apiKey);  // Debug print
    
    const response = await axios.get(`${homeAssistantURL}/states`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,  // Use the API key passed
        'Content-Type': 'application/json',
      },
    });

    console.log('Received response from Home Assistant:', response.data);  // Debug print
    // Filter sensors (or entities that start with `sensor.`)
    const sensorData = response.data.filter((entity) => entity.entity_id.startsWith('sensor.'));
    return sensorData;
  } catch (error) {
    console.error('Error fetching data from Home Assistant:', error);
    return [];
  }
};

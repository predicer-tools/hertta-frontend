// fetchAllDevices.js
export const fetchAllDevices = async (apiKey, setResults, setError) => {
    if (!apiKey) {
      setError('API key is missing. Please enter your API key.');
      return;
    }
  
    try {
      const response = await fetch('http://192.168.129.96:8123/api/states', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      // Filter out sensors if needed, or return all devices
      const nonSensorDevices = data.filter(entity => !entity.entity_id.startsWith('sensor.'));
      setResults(nonSensorDevices); // Store the fetched devices in the results state
      setError(null);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(error.message);
    }
  };
  
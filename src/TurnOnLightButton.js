import React from 'react';

const TurnOnLightButton = ({ apiKey }) => {
  const turnOnLight = async () => {
    const url = 'http://192.168.129.96:8123/api/services/light/turn_on';
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      entity_id: 'light.light1', // Assuming 'light1' is the correct entity ID
    });

    // Log the request details
    console.log('Making API Request:', {
      url,
      headers,
      body,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      // Log the raw response status
      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to turn on light: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Light turned on successfully:', data);
    } catch (error) {
      console.error('Error turning on the light:', error);
    }
  };

  return <button onClick={turnOnLight}>Turn On Light</button>;
};

export default TurnOnLightButton;

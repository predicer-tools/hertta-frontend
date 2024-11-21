// Function to control the electric heater (lamp)
export const controlElectricHeater = async (entityId, action, apiKey) => {
    try {
        const url = `http://192.168.41.27:8123//api/services/light/${action}`;
        
        // Prepend "light." to the entityId if it doesn't already start with it
        const fullEntityId = entityId.startsWith('light.') ? entityId : `light.${entityId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,  // Include the API key for authentication
                'Content-Type': 'application/json',   // Ensure we're sending JSON data
            },
            body: JSON.stringify({
                entity_id: fullEntityId  // Use the prefixed entity ID
            }),
        });

        // Check for a valid response
        if (!response.ok) {
            const errorText = await response.text(); // Capture error text for better debugging
            console.error(`Failed to ${action} heater: ${response.status} - ${errorText}`);
            return;
        }

        const data = await response.json();  // Handle successful response
        console.log(`Heater control (${action}) response:`, data);
    } catch (error) {
        // Catch and log any other errors
        console.error(`Error controlling heater (${action}):`, error);
    }
};

// Function to trigger time-series control of the heater (lamp)
export const triggerTimeSeriesControl = async (entityId) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/time-series-control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entityId: entityId, // Pass the entity ID of the electric heater or lamp
            }),
        });

        // Check for a valid response
        if (!response.ok) {
            const errorText = await response.text(); // Capture error text for debugging
            console.error(`Failed time-series control: ${response.status} - ${errorText}`);
            return;
        }

        const data = await response.json();  // Handle successful response
        console.log('Time-series control response:', data);
    } catch (error) {
        // Catch and log any other errors
        console.error('Error in time-series control:', error);
    }
};

// src/weatherApi.js

/**
 * Fetches weather data from the Python server.
 *
 * @param {string} startTime - Start time in ISO format (e.g., "2023-10-01T00:00:00Z").
 * @param {string} endTime - End time in ISO format (e.g., "2023-10-02T00:00:00Z").
 * @param {string} place - Place name (e.g., "Helsinki").
 * @returns {Promise<Object>} - A promise that resolves to the weather data, including currentTemp.
 */
export async function fetchWeatherData(startTime, endTime, place) {
    const baseUrl = 'http://localhost:5000/get_weather_data';
    const params = new URLSearchParams({ start_time: startTime, end_time: endTime, place });

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        // Fetch the response as text
        const text = await response.text();

        // Replace all instances of NaN with null
        const sanitizedText = text.replace(/NaN/g, 'null');

        // Parse the sanitized text as JSON
        const data = JSON.parse(sanitizedText);

        // Extract currentTemp from the first entry of weather_values
        let currentTemp = null;
        if (data.weather_values && Array.isArray(data.weather_values) && data.weather_values.length > 0) {
            currentTemp = data.weather_values[0].value; // Adjust based on your data structure
        }

        return {
            ...data,
            currentTemp, // Add currentTemp to the returned data
        };
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        throw error;
    }
}

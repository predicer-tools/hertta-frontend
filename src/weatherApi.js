// src/weatherApi.js

/**
 * Fetches weather data from the Python server.
 *
 * @param {string} startTime - Start time in ISO format (e.g., "2023-10-01T00:00:00Z").
 * @param {string} endTime - End time in ISO format (e.g., "2023-10-02T00:00:00Z").
 * @param {string} place - Place name (e.g., "Helsinki").
 * @returns {Promise<Object>} - A promise that resolves to the weather data.
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
}

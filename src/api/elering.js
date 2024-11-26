// src/api/elering.js

/**
 * Fetches electricity prices for Finland ("fi") from the Elering API.
 * @param {string} start - ISO 8601 formatted start datetime (e.g., "2024-11-26T09:00:00.000Z").
 * @param {string} end - ISO 8601 formatted end datetime (e.g., "2024-11-26T18:00:00.000Z").
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of price objects.
 */
export async function fetchElectricityPricesFi(start, end) {
    const url = `https://dashboard.elering.ee/api/nps/price?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.success && result.data && result.data.fi) {
        return result.data.fi;
      } else {
        throw new Error('Failed to fetch FI electricity prices.');
      }
    } catch (error) {
      console.error('Error fetching FI electricity prices:', error);
      throw error;
    }
  }
  
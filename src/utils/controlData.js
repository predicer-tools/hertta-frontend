// src/utils/controlData.js

/**
 * Generates control signals (ON/OFF) for each heater based on electricity prices.
 * Heaters are turned ON when the price is below the average price, otherwise OFF.
 * Disabled heaters receive 'OFF' signals regardless of electricity prices.
 *
 * @param {Array} heaters - Array of heater objects.
 * @param {Array} fiElectricityPrices - Array of electricity price objects sorted by timestamp ascending.
 * @returns {Object} - An object mapping heater IDs to their control signals for the next 12 hours.
 */
export function generateControlSignals(heaters, fiElectricityPrices) {
    const controlSignals = {};
  
    if (!heaters || heaters.length === 0) return controlSignals;
    if (!fiElectricityPrices || fiElectricityPrices.length === 0) {
      // If no price data, default all to OFF
      heaters.forEach((heater) => {
        controlSignals[heater.id] = Array(12).fill('OFF');
      });
      return controlSignals;
    }
  
    // Calculate the average price over the next 12 hours
    const next12Prices = fiElectricityPrices.slice(0, 12);
    const averagePrice =
      next12Prices.reduce((sum, entry) => sum + entry.price, 0) / next12Prices.length;
  
    // Determine threshold (e.g., average price)
    const threshold = averagePrice;
  
    heaters.forEach((heater) => {
      if (!heater.isEnabled) {
        // If the heater is disabled, set all control signals to 'OFF'
        controlSignals[heater.id] = Array(12).fill('OFF');
      } else {
        // For each heater, generate an array of 12 control signals based on price
        controlSignals[heater.id] = next12Prices.map((priceEntry) =>
          priceEntry.price < threshold ? 'ON' : 'OFF'
        );
      }
    });
  
    return controlSignals;
  }
  
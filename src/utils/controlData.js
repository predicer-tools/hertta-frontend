// src/utils/controlData.js

/**
 * Generates control signals (ON/OFF) for each heater based on electricity prices.
 * Heaters are turned ON when the price is below the average price, otherwise OFF.
 * Disabled heaters receive 'OFF' signals regardless of electricity prices.
 * Ensures that each enabled heater has at least one 'ON' signal.
 *
 * @param {Array} heaters - Array of heater objects.
 * @param {Array} fiElectricityPrices - Array of electricity price objects sorted by timestamp ascending.
 * @returns {Object} - An object mapping heater IDs to their control signals for the next 12 hours.
 */
export function generateControlSignals(heaters, fiElectricityPrices) {
    const controlSignals = {};
  
    if (!heaters || heaters.length === 0) return controlSignals;
  
    if (!fiElectricityPrices || fiElectricityPrices.length === 0) {
      heaters.forEach((heater) => {
        controlSignals[heater.id] = Array(12).fill('OFF');
      });
      console.log('Generated OFF signals for all heaters:', controlSignals);
      return controlSignals;
    }
  
    // Normal signal generation logic
    const next12Prices = fiElectricityPrices.slice(0, 12);
    const averagePrice = next12Prices.reduce((sum, entry) => sum + entry.price, 0) / next12Prices.length;
  
    heaters.forEach((heater) => {
      if (!heater.isEnabled) {
        // Heater is disabled; all signals are 'OFF'
        controlSignals[heater.id] = Array(12).fill('OFF');
      } else {
        // Heater is enabled; assign 'ON' or 'OFF' based on price comparison
        let signals = next12Prices.map((priceEntry) =>
          priceEntry.price < averagePrice ? 'ON' : 'OFF'
        );
  
        // Ensure at least one 'ON' signal
        if (!signals.includes('ON')) {
          // Find the index of the lowest price
          let lowestPriceIndex = 0;
          let lowestPrice = next12Prices[0].price;
  
          next12Prices.forEach((priceEntry, index) => {
            if (priceEntry.price < lowestPrice) {
              lowestPrice = priceEntry.price;
              lowestPriceIndex = index;
            }
          });
  
          // Set the hour with the lowest price to 'ON'
          signals[lowestPriceIndex] = 'ON';
        }
  
        controlSignals[heater.id] = signals;
      }
    });
  
    console.log('Generated control signals:', controlSignals);
    return controlSignals;
  }
  
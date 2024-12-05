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
          controlSignals[heater.id] = Array(12).fill('OFF');
      } else {
          controlSignals[heater.id] = next12Prices.map((priceEntry) =>
              priceEntry.price < averagePrice ? 'ON' : 'OFF'
          );
      }
  });

  console.log('Generated control signals:', controlSignals);
  return controlSignals;
}
  
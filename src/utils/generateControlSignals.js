// src/utils/generateControlSignals.js

export function generateControlSignals() {
    const controlSignals = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) { // 6 hours * 4 intervals per hour
      const time = new Date(now.getTime() + i * 15 * 60000); // 15 minutes in milliseconds
      const status = Math.random() > 0.5 ? 'on' : 'off'; // Randomly assign 'on' or 'off'
      controlSignals.push({ time, status });
    }
    
    return controlSignals;
  }
  
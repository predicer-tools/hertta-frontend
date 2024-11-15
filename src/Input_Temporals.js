// Input_Temporals.js

function generateTemporalsData() {
    const startDate = new Date();
    const timestamps = [];
    const totalIntervals = (12 * 60) / 15; // 12 hours, every 15 minutes
  
    // Round the start date to the next 15-minute interval in UTC
    const minutes = startDate.getUTCMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      startDate.setUTCMinutes(minutes + (15 - remainder));
    } else {
      startDate.setUTCMinutes(minutes);
    }
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);
  
    for (let i = 0; i < totalIntervals; i++) {
      // Calculate the new date by adding i * 15 minutes to the startDate
      const newDate = new Date(startDate.getTime() + i * 15 * 60 * 1000);
  
      // Format timestamp in UTC without milliseconds and with '+00:00' timezone offset
      const isoString = newDate.toISOString(); // Returns in format YYYY-MM-DDTHH:MM:SS.sssZ
      const formattedDate = isoString.replace('.000Z', '+00:00'); // Remove milliseconds and adjust timezone
  
      timestamps.push(formattedDate);
    }
  
    const temporalsData = {
      temporals: {
        t: timestamps,
        dtf: 0.25,
        is_variable_dt: false,
        variable_dt: [],
        ts_format: "yyyy-mm-ddTHH:MM:SSzzzz",
      },
    };
  
    return temporalsData;
  }
  
  export default generateTemporalsData;
  
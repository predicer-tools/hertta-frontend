// src/utils/tempUtils.js

// Days mapping: JavaScript's getDay() returns 0 (Sunday) to 6 (Saturday)
export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Determines the current temperature limits for a room based on the current day and hour.
 * @param {Object} room - The room object containing defaults and exceptions.
 * @returns {Object} - An object containing maxTemp and minTemp for the current hour.
 */
export const getCurrentTempLimits = (room) => {
  const now = new Date();
  const currentDay = daysOfWeek[now.getDay()];
  const currentHour = now.getHours();

  // Find all exceptions that apply to the current day
  const applicableExceptions = room.exceptions.filter(ex => ex.days.includes(currentDay));

  // Initialize with default temperatures
  let currentMaxTemp = room.defaultMaxTemp;
  let currentMinTemp = room.defaultMinTemp;

  // Iterate through exceptions to find if any applies to the current hour
  applicableExceptions.forEach(ex => {
    const [startHourStr, startMinuteStr] = ex.startTime.split(':');
    const [endHourStr, endMinuteStr] = ex.endTime.split(':');

    const startHour = parseInt(startHourStr, 10);
    const startMinute = parseInt(startMinuteStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMinute = parseInt(endMinuteStr, 10);

    const exceptionStart = new Date(now);
    exceptionStart.setHours(startHour, startMinute, 0, 0);

    const exceptionEnd = new Date(now);
    exceptionEnd.setHours(endHour, endMinute, 0, 0);

    // Handle overnight exceptions
    if (exceptionEnd <= exceptionStart) {
      exceptionEnd.setDate(exceptionEnd.getDate() + 1); // Move to next day
    }

    if (now >= exceptionStart && now < exceptionEnd) {
      currentMaxTemp = ex.maxTemp;
      currentMinTemp = ex.minTemp;
    }
  });

  return { maxTemp: currentMaxTemp, minTemp: currentMinTemp };
};

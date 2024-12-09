// src/components/TemperatureCalendar.js

import React, { useContext, useMemo } from 'react';
import DataContext from '../context/DataContext';
import './TemperatureCalendar.css'; // Import the CSS

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hoursOfDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);

function TemperatureCalendar() {
  const { rooms } = useContext(DataContext);

  // Helper function to generate merged timeslots for a room
  const generateRoomSchedule = (room) => {
    const schedule = {};

    daysOfWeek.forEach((day) => {
      // Initialize with default temperatures
      const defaultTemp = {
        maxTemp: room.defaultMaxTemp,
        minTemp: room.defaultMinTemp,
      };

      // Extract exceptions for the day
      const dayExceptions = room.exceptions.filter(ex => ex.days.includes(day));

      // Create an array to hold temperature settings for each hour
      const hourlyTemps = Array.from({ length: 24 }, () => ({ ...defaultTemp }));

      // Apply exceptions
      dayExceptions.forEach(ex => {
        let startHour = parseInt(ex.startTime.split(':')[0], 10);
        let endHour = parseInt(ex.endTime.split(':')[0], 10);

        // Handle overnight exceptions
        if (endHour <= startHour) {
          // From startHour to midnight
          for (let h = startHour; h < 24; h++) {
            hourlyTemps[h] = { maxTemp: ex.maxTemp, minTemp: ex.minTemp };
          }
          // From midnight to endHour
          for (let h = 0; h < endHour; h++) {
            hourlyTemps[h] = { maxTemp: ex.maxTemp, minTemp: ex.minTemp };
          }
        } else {
          // From startHour to endHour
          for (let h = startHour; h < endHour; h++) {
            hourlyTemps[h] = { maxTemp: ex.maxTemp, minTemp: ex.minTemp };
          }
        }
      });

      // Merge consecutive hours with the same temperature settings
      const mergedSlots = [];
      let currentSlot = {
        startHour: 0,
        endHour: 1,
        maxTemp: hourlyTemps[0].maxTemp,
        minTemp: hourlyTemps[0].minTemp,
      };

      for (let h = 1; h < 24; h++) {
        const temp = hourlyTemps[h];
        if (temp.maxTemp === currentSlot.maxTemp && temp.minTemp === currentSlot.minTemp) {
          currentSlot.endHour = h + 1;
        } else {
          mergedSlots.push({ ...currentSlot });
          currentSlot = {
            startHour: h,
            endHour: h + 1,
            maxTemp: temp.maxTemp,
            minTemp: temp.minTemp,
          };
        }
      }
      // Push the last slot
      mergedSlots.push({ ...currentSlot });

      schedule[day] = mergedSlots;
    });

    return schedule;
  };

  // Memoize the schedules to optimize performance
  const roomSchedules = useMemo(() => {
    return rooms.map((room) => ({
      roomId: room.roomId,
      schedule: generateRoomSchedule(room),
    }));
  }, [rooms]);

  // Compute global min and max maxTemp across all rooms and days
  const { minMaxTemp, maxMaxTemp } = useMemo(() => {
    let minTemp = Infinity;
    let maxTemp = -Infinity;

    roomSchedules.forEach(room => {
      daysOfWeek.forEach(day => {
        room.schedule[day].forEach(slot => {
          if (slot.maxTemp < minTemp) minTemp = slot.maxTemp;
          if (slot.maxTemp > maxTemp) maxTemp = slot.maxTemp;
        });
      });
    });

    // Handle cases where no rooms or no slots are present
    if (minTemp === Infinity) minTemp = 0;
    if (maxTemp === -Infinity) maxTemp = 0;

    return { minMaxTemp: minTemp, maxMaxTemp: maxTemp };
  }, [roomSchedules]);

  // Helper function to map maxTemp to a pastel color (blue to orange)
  const getColorForTemp = (temp) => {
    const min = minMaxTemp;
    const max = maxMaxTemp;

    // Avoid division by zero
    const ratio = max !== min ? (temp - min) / (max - min) : 0;

    // Clamp ratio between 0 and 1
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);

    // Convert ratio to hue: 240 (blue) to 30 (orange)
    const hue = 240 - (210 * clampedRatio); // 240 (blue) to 30 (orange)

    // Pastel colors: reduce saturation and increase lightness
    return `hsl(${hue}, 30%, 70%)`;
  };

  return (
    <div className="temperature-calendar-container">
      {roomSchedules.length === 0 ? (
        <p>No rooms available. Please add a room to view the calendar.</p>
      ) : (
        roomSchedules.map((room) => (
          <div key={room.roomId} className="room-calendar">
            <h3>{room.roomId}</h3>
            <div className="calendar-wrapper">
              {/* Time Axis */}
              <div className="time-axis">
                {hoursOfDay.map((hour, index) => (
                  <div
                    key={hour}
                    className="time-label"
                    style={{
                      top: `${(index / 24) * 100}%`,
                      height: `${100 / 24}%`,
                    }}
                  >
                    {hour}
                  </div>
                ))}
              </div>
              {/* Days Grid */}
              <div className="calendar-grid">
                {daysOfWeek.map((day) => (
                  <div key={day} className="day-column">
                    <div className="day-header">{day}</div>
                    <div className="timeslots">
                      {room.schedule[day].map((slot, index) => {
                        const isException = slot.maxTemp !== room.defaultMaxTemp || slot.minTemp !== room.defaultMinTemp;
                        const color = getColorForTemp(slot.maxTemp);
                        return (
                          <div
                            key={index}
                            className={`timeslot ${isException ? 'exception' : ''}`}
                            style={{
                              top: `${(slot.startHour / 24) * 100}%`,
                              height: `${((slot.endHour - slot.startHour) / 24) * 100}%`,
                              backgroundColor: color,
                            }}
                            title={`From ${slot.startHour}:00 to ${slot.endHour}:00\nMax Temp: ${slot.maxTemp}°C\nMin Temp: ${slot.minTemp}°C`}
                          >
                            <div className="temp-info">
                              <span className="max-temp">↑ {slot.maxTemp}°C</span>
                              <span className="min-temp">↓ {slot.minTemp}°C</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TemperatureCalendar;

// src/utils/timeSlot.js - Utility functions for time slot calculations

/**
 * Convert a Date object to a 30-minute time slot string
 * @param {Date} date - Date object
 * @returns {string} Time slot string (e.g., '08:00-08:30')
 */
export function getTimeSlot(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Determine which 30-minute slot we're in
  const slotMinute = minute < 30 ? 0 : 30;
  
  // Calculate next hour/minute carefully to handle 23:30 to 00:00 transition
  let nextHour = hour;
  let nextMinute = 0;

  if (minute >= 30) {
    nextHour = (hour + 1) % 24;
    nextMinute = 0;
  } else {
    nextMinute = 30;
  }
  
  const startStr = `${String(hour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
  const endStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
  
  return `${startStr}-${endStr}`;
}

/**
 * Get weekday number (0=Monday, 6=Sunday)
 * JavaScript's getDay() returns 0=Sunday, 6=Saturday
 * We convert to 0=Monday, 6=Sunday
 * @param {Date} date - Date object
 * @returns {number} Weekday (0-6)
 */
export function getWeekday(date) {
  // Convert JS Sunday=0 to Monday=0
  const jsDay = date.getDay();
  return (jsDay + 6) % 7; // Monday=0, Tuesday=1, ..., Sunday=6
}

/**
 * Parse a time slot string to get start hour and minute
 * @param {string} timeSlot - Time slot string (e.g., '08:00-08:30')
 * @returns {Object|null} Object with hour and minute, or null if invalid
 */
export function parseTimeSlot(timeSlot) {
  const match = timeSlot.match(/^(\d{2}):(\d{2})-\d{2}:\d{2}$/);
  if (!match) return null;
  return {
    hour: parseInt(match[1], 10),
    minute: parseInt(match[2], 10)
  };
}
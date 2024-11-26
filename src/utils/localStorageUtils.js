// src/utils/localStorageUtils.js

/**
 * Retrieves a value from localStorage and parses it as JSON.
 * @param {string} key - The key to retrieve.
 * @returns {any} - The parsed value or null if not found/error.
 */
export const getItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item "${key}" from localStorage:`, error);
      return null;
    }
  };
  
  /**
   * Stores a value in localStorage after stringifying it.
   * @param {string} key - The key to store the value under.
   * @param {any} value - The value to store.
   */
  export const setItem = (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item "${key}" in localStorage:`, error);
    }
  };
  
  /**
   * Removes a specific item from localStorage.
   * @param {string} key - The key to remove.
   */
  export const removeItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}" from localStorage:`, error);
    }
  };
  
  /**
   * Clears all items from localStorage.
   */
  export const clearStorage = () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };
  
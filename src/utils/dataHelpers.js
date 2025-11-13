/**
 * Utility functions for safe data handling
 */

/**
 * Safely extract array from API response
 * Handles various response structures
 */
export const extractArrayFromResponse = (response, ...paths) => {
  if (!response) return [];
  
  // Try each path in order
  for (const path of paths) {
    const keys = path.split('.');
    let value = response;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    
    if (Array.isArray(value)) {
      return value;
    }
  }
  
  // Fallback: return empty array
  return [];
};

/**
 * Ensure value is an array
 */
export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

/**
 * Safe filter - returns empty array if input is not an array
 */
export const safeFilter = (array, predicate) => {
  if (!Array.isArray(array)) return [];
  return array.filter(predicate);
};

/**
 * Safe map - returns empty array if input is not an array
 */
export const safeMap = (array, mapper) => {
  if (!Array.isArray(array)) return [];
  return array.map(mapper);
};

/**
 * Get nested property safely
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined || value === null) return defaultValue;
  }
  
  return value;
};

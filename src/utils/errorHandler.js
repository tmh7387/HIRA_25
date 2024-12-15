// Error codes for consistent error handling
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  SYNC_ERROR: 'SYNC_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Creates a standardized error object
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {Object} [details] - Additional error details
 * @returns {Error} Standardized error object
 */
export function createError(code, message, details = {}) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Handles errors in a consistent way across the application
 * @param {Error} error - Error object to handle
 * @param {string} context - Where the error occurred
 * @returns {Object} Standardized error object for UI
 */
export function handleError(error, context = 'unknown') {
  console.error(`Error in ${context}:`, error);

  // If it's already our standardized error, return it
  if (error.code && Object.values(ERROR_CODES).includes(error.code)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      context
    };
  }

  // Handle Supabase errors
  if (error.code?.startsWith('PGRST')) {
    return {
      code: ERROR_CODES.API_ERROR,
      message: 'Database operation failed',
      details: { originalError: error },
      context
    };
  }

  // Handle storage errors
  if (error.message?.includes('storage')) {
    return {
      code: ERROR_CODES.STORAGE_ERROR,
      message: 'File operation failed',
      details: { originalError: error },
      context
    };
  }

  // Default error handling
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error.message || 'An unexpected error occurred',
    details: { originalError: error },
    context
  };
}

/**
 * Formats error message for UI display
 * @param {Object} error - Error object from handleError
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error) {
  switch (error.code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return `Validation Error: ${error.message}`;
    case ERROR_CODES.API_ERROR:
      return `API Error: ${error.message}`;
    case ERROR_CODES.STORAGE_ERROR:
      return `Storage Error: ${error.message}`;
    case ERROR_CODES.FILE_TOO_LARGE:
      return `File is too large: ${error.message}`;
    case ERROR_CODES.INVALID_FILE_TYPE:
      return `Invalid file type: ${error.message}`;
    case ERROR_CODES.UPLOAD_FAILED:
      return `Upload failed: ${error.message}`;
    case ERROR_CODES.SYNC_ERROR:
      return `Sync failed: ${error.message}`;
    default:
      return error.message || 'An unexpected error occurred';
  }
}

/**
 * Checks if an error is of a specific type
 * @param {Error} error - Error to check
 * @param {string} code - Error code to check against
 * @returns {boolean} Whether the error matches the code
 */
export function isErrorType(error, code) {
  return error?.code === code;
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Error context
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, context);
    }
  };
}

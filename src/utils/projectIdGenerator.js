/**
 * Generates a unique project ID with a specific format:
 * HIRA-YYYYMMDD-HHMMSS-XXX
 * where XXX is a random 3-digit number
 * @returns {string} Generated project ID
 */
export function generateProjectId() {
  const now = new Date();
  
  // Format date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate random 3-digit number
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  // Combine all parts
  return `HIRA-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Validates a project ID format
 * @param {string} projectId - Project ID to validate
 * @returns {boolean} Whether the ID is valid
 */
export function isValidProjectId(projectId) {
  const pattern = /^HIRA-\d{8}-\d{6}-\d{3}$/;
  return pattern.test(projectId);
}

/**
 * Extracts the timestamp from a project ID
 * @param {string} projectId - Project ID to parse
 * @returns {Date|null} Date object or null if invalid
 */
export function getProjectTimestamp(projectId) {
  if (!isValidProjectId(projectId)) return null;
  
  const [, datePart, timePart] = projectId.split('-');
  
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1; // JS months are 0-based
  const day = parseInt(datePart.substring(6, 8));
  const hours = parseInt(timePart.substring(0, 2));
  const minutes = parseInt(timePart.substring(2, 4));
  const seconds = parseInt(timePart.substring(4, 6));
  
  return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Compares two project IDs chronologically
 * @param {string} idA - First project ID
 * @param {string} idB - Second project ID
 * @returns {number} -1 if A is earlier, 1 if B is earlier, 0 if equal
 */
export function compareProjectIds(idA, idB) {
  const timeA = getProjectTimestamp(idA)?.getTime();
  const timeB = getProjectTimestamp(idB)?.getTime();
  
  if (!timeA || !timeB) return 0;
  if (timeA < timeB) return -1;
  if (timeA > timeB) return 1;
  return 0;
}

/**
 * Gets a human-readable string from a project ID
 * @param {string} projectId - Project ID to format
 * @returns {string} Formatted string or original ID if invalid
 */
export function formatProjectId(projectId) {
  const timestamp = getProjectTimestamp(projectId);
  if (!timestamp) return projectId;
  
  const [, , randomPart] = projectId.split('-');
  const dateStr = timestamp.toLocaleDateString();
  const timeStr = timestamp.toLocaleTimeString();
  
  return `${dateStr} ${timeStr} (${randomPart})`;
}

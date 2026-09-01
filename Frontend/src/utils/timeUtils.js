/**
 * Time utility functions for formatting and checking story/post timestamps
 */

/**
 * Check if a story has expired (24 hours old)
 * @param {string|number|Date} timestamp - Story creation timestamp
 * @returns {boolean} True if story is older than 24 hours
 */
export function isStoryExpired(timestamp) {
  if (!timestamp) return false;
  const storyTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  const hours24 = 24 * 60 * 60 * 1000;
  return now - storyTime > hours24;
}

/**
 * Format story timestamp in IST (Indian Standard Time)
 * @param {string|number|Date} timestamp - Story creation timestamp
 * @returns {string} Formatted time string
 */
export function formatStoryTimeIST(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
export function formatISTRelative(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp in IST date and time
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date and time
 */
export function formatIST(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get remaining time for story expiry
 * @param {string|number|Date} timestamp - Story creation timestamp
 * @param {number} expiryHours - Hours until expiry (default 24)
 * @returns {string} Remaining time string
 */
export function getStoryRemainingTime(timestamp, expiryHours = 24) {
  if (!timestamp) return '';
  const storyTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  const totalMs = expiryHours * 60 * 60 * 1000;
  const elapsedMs = now - storyTime;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  
  const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  if (remainingHours > 0) {
    return `${remainingHours}h ${remainingMins}m`;
  }
  return `${remainingMins}m`;
}

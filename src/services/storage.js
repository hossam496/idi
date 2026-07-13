/**
 * User-namespaced localStorage service.
 * 
 * All keys are prefixed with "idi_{userId}_" so that each student's data
 * is fully isolated. When the backend is ready, only this file needs to
 * be replaced with API calls — no React component changes required.
 */

const PREFIX = 'idi';

/**
 * Build a namespaced localStorage key.
 * @param {string} userId 
 * @param {string} key    e.g. "chat_list", "grammar", "vocabulary", "stats"
 * @returns {string}      e.g. "idi_a3f8b2_chat_list"
 */
export function getUserKey(userId, key) {
  return `${PREFIX}_${userId}_${key}`;
}

/**
 * Load JSON data for a specific user + key.
 * @param {string} userId 
 * @param {string} key 
 * @returns {any|null} Parsed JSON or null if not found / invalid
 */
export function loadUserData(userId, key) {
  try {
    const raw = localStorage.getItem(getUserKey(userId, key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save JSON data for a specific user + key.
 * @param {string} userId 
 * @param {string} key 
 * @param {any} data 
 */
export function saveUserData(userId, key, data) {
  localStorage.setItem(getUserKey(userId, key), JSON.stringify(data));
}

/**
 * Remove a specific key for a user.
 * @param {string} userId 
 * @param {string} key 
 */
export function removeUserData(userId, key) {
  localStorage.removeItem(getUserKey(userId, key));
}

/**
 * Clear ALL localStorage keys belonging to a specific user.
 * Useful for account deletion or full data reset.
 * @param {string} userId 
 */
export function clearAllUserData(userId) {
  const prefix = getUserKey(userId, '');
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

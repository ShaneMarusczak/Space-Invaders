/**
 * Storage Module
 * Handles persistent game data using localStorage
 */

const STORAGE_PREFIX = 'spaceInvaders_';

/**
 * Retrieves a value from localStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} The stored value or default
 */
export function getItem(key, defaultValue = 0) {
  try {
    const value = localStorage.getItem(STORAGE_PREFIX + key);
    if (value === null) return defaultValue;

    // Try to parse as JSON, fall back to raw value
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
    return defaultValue;
  }
}

/**
 * Stores a value in localStorage
 * @param {string} key - The key to store under
 * @param {*} value - The value to store
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
}

/**
 * Removes a value from localStorage
 * @param {string} key - The key to remove
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
}

/**
 * Gets the current score
 * @returns {number} Current score
 */
export function getCurrentPoints() {
  return getItem('currentPoints', 0);
}

/**
 * Sets the current score
 * @param {number} points - Points to save
 */
export function setCurrentPoints(points) {
  setItem('currentPoints', points);
}

/**
 * Gets the high score
 * @returns {number} High score
 */
export function getHighScore() {
  return getItem('highScore', 0);
}

/**
 * Sets the high score if it's higher than current
 * @param {number} score - Score to potentially save
 * @returns {boolean} Whether a new high score was set
 */
export function updateHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    setItem('highScore', score);
    return true;
  }
  return false;
}

/**
 * Gets the player win count
 * @returns {number} Number of wins
 */
export function getPlayerWins() {
  return getItem('playerWins', 0);
}

/**
 * Increments the player win count
 * @returns {number} New win count
 */
export function incrementWins() {
  const wins = getPlayerWins() + 1;
  setItem('playerWins', wins);
  return wins;
}

/**
 * Gets the player loss count
 * @returns {number} Number of losses
 */
export function getPlayerLosses() {
  return getItem('playerLosses', 0);
}

/**
 * Increments the player loss count
 * @returns {number} New loss count
 */
export function incrementLosses() {
  const losses = getPlayerLosses() + 1;
  setItem('playerLosses', losses);
  return losses;
}

/**
 * Gets the current level
 * @returns {number} Current level
 */
export function getCurrentLevel() {
  return getItem('currentLevel', 1);
}

/**
 * Sets the current level
 * @param {number} level - Level to save
 */
export function setCurrentLevel(level) {
  setItem('currentLevel', level);
}

/**
 * Resets level to 1 (on loss)
 */
export function resetLevel() {
  setItem('currentLevel', 1);
}

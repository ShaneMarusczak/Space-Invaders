/**
 * UI Module
 * Handles all DOM manipulation and UI updates
 */

import { POINTS_FLASH_DURATION, UPGRADE_TEXT_DURATION } from './constants.js';

/**
 * Converts a number to a CSS pixel value string
 * @param {number} num - The number to convert
 * @returns {string} The number with 'px' appended
 */
export function convertToPXs(num) {
  return num + "px";
}

/**
 * Returns a Promise that resolves after the specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Displays a modal message overlay for a specified duration
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the modal (in ms)
 */
export function showModal(message, duration) {
  const modalBox = document.createElement("div");
  modalBox.id = "modal-box";
  modalBox.setAttribute("role", "dialog");
  modalBox.setAttribute("aria-modal", "true");
  modalBox.setAttribute("aria-label", message);

  const innerModalBox = document.createElement("div");
  innerModalBox.id = "inner-modal-box";

  const modalMessage = document.createElement("span");
  modalMessage.id = "modal-message";
  modalMessage.innerText = message;

  innerModalBox.appendChild(modalMessage);
  modalBox.appendChild(innerModalBox);
  document.body.appendChild(modalBox);

  // Announce to screen readers
  announceToScreenReader(message);

  sleep(duration).then(() => modalBox.remove());
}

/**
 * Displays upgrade notification text that fades after a delay
 * @param {string} message - The upgrade message to display
 */
export function showUpgradeText(message) {
  const upgradeText = document.getElementById("upgradeText");
  if (upgradeText) {
    upgradeText.textContent = message;
    announceToScreenReader(message);
    sleep(UPGRADE_TEXT_DURATION).then(() => {
      upgradeText.textContent = "";
    });
  }
}

/**
 * Flashes the points display to indicate score change
 */
export function flashPoints() {
  const winLoss = document.getElementById("winLoss");
  if (winLoss) {
    winLoss.classList.add("pointsFlash");
    sleep(POINTS_FLASH_DURATION).then(() => {
      winLoss.classList.remove("pointsFlash");
    });
  }
}

/**
 * Updates the displayed score
 * @param {number} points - The current score
 */
export function updatePointsDisplay(points) {
  const pointsElement = document.getElementById("points");
  if (pointsElement) {
    pointsElement.textContent = points;
  }
}

/**
 * Updates the displayed high score
 * @param {number} score - The high score
 */
export function updateHighScoreDisplay(score) {
  const highScoreElement = document.getElementById("highScore");
  if (highScoreElement) {
    highScoreElement.textContent = score;
  }
}

/**
 * Updates the displayed win count
 * @param {number} wins - Number of wins
 */
export function updateWinsDisplay(wins) {
  const winsElement = document.getElementById("playerWins");
  if (winsElement) {
    winsElement.textContent = wins;
  }
}

/**
 * Updates the displayed loss count
 * @param {number} losses - Number of losses
 */
export function updateLossesDisplay(losses) {
  const lossesElement = document.getElementById("playerLosses");
  if (lossesElement) {
    lossesElement.textContent = losses;
  }
}

/**
 * Updates the displayed level
 * @param {number} level - Current level
 */
export function updateLevelDisplay(level) {
  const levelElement = document.getElementById("currentLevel");
  if (levelElement) {
    levelElement.textContent = level;
  }
}

/**
 * Sets the reload button text
 * @param {string} text - Button text
 */
export function setReloadButtonText(text) {
  const reloadButton = document.getElementById("reload");
  if (reloadButton) {
    reloadButton.textContent = text;
  }
}

/**
 * Shows or hides the pause overlay
 * @param {boolean} paused - Whether game is paused
 */
export function setPauseOverlay(paused) {
  const gameBoard = document.getElementById("gameBoard");
  if (gameBoard) {
    if (paused) {
      gameBoard.classList.add("paused");
    } else {
      gameBoard.classList.remove("paused");
    }
  }
}

/**
 * Shows the fireworks canvas
 */
export function showFireworks() {
  const canvas = document.getElementById("myCanvas");
  if (canvas) {
    canvas.style.display = "block";
  }
}

/**
 * Hides the fireworks canvas
 */
export function hideFireworks() {
  const canvas = document.getElementById("myCanvas");
  if (canvas) {
    canvas.style.display = "none";
  }
}

/**
 * Removes all lasers from the game board
 */
export function removeAllLasers() {
  Array.from(document.getElementsByClassName("laser")).forEach((l) => l.remove());
  Array.from(document.getElementsByClassName("enemyLaser")).forEach((l) => l.remove());
}

/**
 * Announces a message to screen readers using a live region
 * @param {string} message - Message to announce
 */
export function announceToScreenReader(message) {
  let announcer = document.getElementById("sr-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
  }
  announcer.textContent = message;
}

/**
 * Scrolls the game board into view
 */
export function scrollToGame() {
  const winLoss = document.getElementById("winLoss");
  if (winLoss) {
    winLoss.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Removes the start button flash animation
 */
export function removeStartButtonFlash() {
  const startButton = document.getElementById("start");
  if (startButton) {
    startButton.classList.remove("startButtonFlash");
  }
}

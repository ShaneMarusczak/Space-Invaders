/**
 * Player Module
 * Handles player ship control and laser firing
 */

import {
  TICK_MOVEMENT,
  SHIP_WIDTH_OFFSET,
  LASER_VERTICAL_OFFSET,
  LASER_INITIAL_OFFSET,
  PLAYER_LASER_LEFT_OFFSET,
  PLAYER_LASER_ITERATIONS,
  COMBO_THRESHOLD
} from './constants.js';
import { collides, checkBlockerCollision } from './collision.js';
import { convertToPXs, sleep, showUpgradeText, flashPoints, updatePointsDisplay } from './ui.js';
import { getEnemyShips, moveEnemyShips } from './enemies.js';

/**
 * Creates the player control handler
 * @param {Object} gameState - Reference to game state
 * @param {Function} getGameState - Function to get current game state
 * @param {Function} updateGameState - Function to update game state
 * @param {Function} onEnemyDestroyed - Callback when enemy is destroyed
 * @returns {Function} Event handler function
 */
export function createShipControlHandler(gameState, getGameState, updateGameState, onEnemyDestroyed) {
  const ship = document.getElementById("ship");
  const gameBoard = document.getElementById("gameBoard");

  return function shipControl(e) {
    const state = getGameState();

    if (!state.gameStarted || state.gameOver || state.paused) return;

    const posLeft = ship.offsetLeft - gameBoard.offsetLeft - 1;

    // Left movement (Arrow Left or 'a')
    if ((e.key === "ArrowLeft" || e.key === "a") && posLeft - TICK_MOVEMENT >= 0) {
      e.preventDefault();
      ship.style.marginLeft = convertToPXs(posLeft - TICK_MOVEMENT);
    }
    // Right movement (Arrow Right or 'd')
    else if (
      (e.key === "ArrowRight" || e.key === "d") &&
      posLeft + TICK_MOVEMENT <= gameBoard.offsetWidth - SHIP_WIDTH_OFFSET
    ) {
      e.preventDefault();
      ship.style.marginLeft = convertToPXs(posLeft + TICK_MOVEMENT);
    }
    // Fire (Space, Arrow Up, or 'w')
    else if ((e.key === " " || e.key === "ArrowUp" || e.key === "w") && state.canFire) {
      e.preventDefault();
      updateGameState({ shotsFired: state.shotsFired + 1, canFire: false });

      sleep(state.cantFireInterval).then(() => {
        updateGameState({ canFire: true });
      });

      firePlayerLaser(ship, getGameState, updateGameState, onEnemyDestroyed);
    }
  };
}

/**
 * Creates and fires a laser from the player's ship
 * @param {HTMLElement} ship - The player's ship element
 * @param {Function} getGameState - Function to get current game state
 * @param {Function} updateGameState - Function to update game state
 * @param {Function} onEnemyDestroyed - Callback when enemy is destroyed
 */
function firePlayerLaser(ship, getGameState, updateGameState, onEnemyDestroyed) {
  const laser = document.createElement("div");
  laser.classList.add("laser");
  laser.style.left = convertToPXs(ship.offsetLeft + PLAYER_LASER_LEFT_OFFSET);
  laser.style.top = convertToPXs(ship.offsetTop - LASER_VERTICAL_OFFSET);
  ship.appendChild(laser);

  const state = getGameState();

  for (let i = 0; i < PLAYER_LASER_ITERATIONS; i++) {
    sleep(i * state.playerLaserInterval).then(() => {
      if (!laser.parentElement) return; // Laser already removed

      laser.style.top = convertToPXs(
        ship.offsetTop - LASER_INITIAL_OFFSET - TICK_MOVEMENT * i
      );

      // Check blocker collision
      checkBlockerCollision(laser, (blocker) => {
        laser.remove();
        blocker.classList.remove("blocker");
      });

      // Check enemy collision
      if (laser.parentElement) {
        getEnemyShips().forEach((enemy) => {
          if (collides(enemy, laser)) {
            handleEnemyHit(enemy, laser, getGameState, updateGameState, onEnemyDestroyed);
          }
        });
      }
    });
  }

  // Remove laser after flight completes (missed all targets)
  sleep(PLAYER_LASER_ITERATIONS * state.playerLaserInterval).then(() => {
    if (laser.parentElement) {
      updateGameState({ hitsInARow: 0 });
      laser.remove();
    }
  });
}

/**
 * Handles the destruction of an enemy ship
 * @param {HTMLElement} enemy - The enemy ship element
 * @param {HTMLElement} laser - The laser element
 * @param {Function} getGameState - Function to get current game state
 * @param {Function} updateGameState - Function to update game state
 * @param {Function} onEnemyDestroyed - Callback for win condition check
 */
function handleEnemyHit(enemy, laser, getGameState, updateGameState, onEnemyDestroyed) {
  laser.remove();
  enemy.remove();

  const state = getGameState();
  const newHitsInARow = state.hitsInARow + 1;
  const newDestroyedEnemies = state.destroyedEnemies + 1;

  // Calculate points with combo multiplier
  const comboMultiplier = Math.floor(newHitsInARow / COMBO_THRESHOLD) + 1;
  const pointsEarned = comboMultiplier * Number(enemy.attributes.points.value);
  const newPoints = state.currentPoints + pointsEarned;

  updateGameState({
    hitsInARow: newHitsInARow,
    destroyedEnemies: newDestroyedEnemies,
    currentPoints: newPoints
  });

  // Flash points and update display
  flashPoints();
  updatePointsDisplay(newPoints);

  // Bonus: enemies retreat on combo threshold
  if (newHitsInARow % COMBO_THRESHOLD === 0) {
    showUpgradeText("The Enemy Retreats!");
    moveEnemyShips("ver", -1);
  }

  // Check win condition
  onEnemyDestroyed(newDestroyedEnemies);
}

/**
 * Enemies Module
 * Handles enemy ship creation, movement, and laser firing
 */

import {
  GRID_ROWS,
  GRID_COLS,
  LEFT_BOUNDARY_COL,
  RIGHT_BOUNDARY_COL,
  TICK_MOVEMENT,
  COMPUTER_LASER_MOVE_DELAY,
  COMPUTER_REFIRE_DELAY_MIN,
  COMPUTER_REFIRE_DELAY_MAX,
  ENEMY_FIRE_CHANCE,
  ENEMY_CONTINUOUS_FIRE_CHANCE,
  ENEMY_ROWS,
  ENEMIES_PER_ROW,
  ENEMY_ROW_SPACING,
  ENEMY_COL_SPACING,
  SHIELD_ROWS,
  SHIELD_COLUMN_GROUPS,
  SHIELD_CORNER_COLS,
  IMAGE_STORE
} from './constants.js';
import { collides, checkBlockerCollision } from './collision.js';
import { convertToPXs, sleep } from './ui.js';
import { randomIntFromInterval } from './utils.js';

/**
 * Returns a collection of all enemy ship elements currently in the DOM
 * @returns {HTMLElement[]} Array of enemy ship elements
 */
export function getEnemyShips() {
  return Array.from(document.getElementsByClassName("enemyShip"));
}

/**
 * Checks if any enemy ships are in the specified column
 * @param {string} col - Column number as string
 * @returns {boolean} True if any enemies are in that column
 */
export function enemiesInColumn(col) {
  return getEnemyShips().some(
    (es) => es.attributes.currentCell.value.split("-")[1] === col
  );
}

/**
 * Checks if a cell should be a blocker based on the shield pattern
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if the cell should be a blocker
 */
function isBlockerCell(row, col) {
  const allShieldCols = SHIELD_COLUMN_GROUPS.flat();

  // Main shield body (rows 25-26)
  if (SHIELD_ROWS.mainRows.includes(row) && allShieldCols.includes(col)) {
    // Exclude corners on row 25 to create arch shape
    if (row === 25 && SHIELD_CORNER_COLS.includes(col)) {
      return false;
    }
    return true;
  }

  // Bottom row corners only (row 27)
  if (row === SHIELD_ROWS.bottomRow && SHIELD_CORNER_COLS.includes(col)) {
    return true;
  }

  return false;
}

/**
 * Creates the game grid with cells and blocker shields
 */
export function initializeGrid() {
  const enemiesContainer = document.getElementById("enemies");
  if (!enemiesContainer) return;

  // Clear existing grid
  enemiesContainer.innerHTML = '';

  for (let i = 0; i < GRID_ROWS; i++) {
    const shipRow = document.createElement("div");
    enemiesContainer.appendChild(shipRow);
    shipRow.classList.add("ship-row");
    shipRow.id = "row-" + i;

    for (let j = 0; j < GRID_COLS; j++) {
      const shipCell = document.createElement("div");
      shipRow.appendChild(shipCell);
      shipCell.classList.add("ship-cell");
      shipCell.id = "cell-" + i + "-" + j;

      if (isBlockerCell(i, j)) {
        shipCell.classList.add("blocker");
      }
    }
  }
}

/**
 * Spawns enemy ships in their starting positions
 * @returns {number} Total number of enemies spawned
 */
export function initializeEnemies() {
  let count = 0;

  for (let i = 1; i <= ENEMY_ROWS; i++) {
    const shipImgToUse = IMAGE_STORE[i - 1];
    for (let j = 1; j <= ENEMIES_PER_ROW; j++) {
      const enemyShip = document.createElement("div");
      const shipImg = document.createElement("img");
      shipImg.src = shipImgToUse;
      shipImg.classList.add("enemyShipImg");
      shipImg.alt = "Enemy ship";
      enemyShip.appendChild(shipImg);
      enemyShip.classList.add("enemyShip");

      const row = ENEMY_ROW_SPACING * i;
      const col = ENEMY_COL_SPACING * j;
      const cellId = row + "-" + col;

      const cell = document.getElementById("cell-" + cellId);
      if (cell) {
        cell.appendChild(enemyShip);
        enemyShip.setAttribute("currentCell", cellId);
        // Points: 50, 40, 30, 20 based on row (higher rows worth more)
        enemyShip.setAttribute("points", -10 * i + 60);
        count++;
      }
    }
  }

  return count;
}

/**
 * Moves all enemy ships in the specified direction
 * @param {string} direction - "hor" for horizontal, "ver" for vertical
 * @param {number} distance - Number of cells to move (positive or negative)
 */
export function moveEnemyShips(direction, distance) {
  const blockers = document.querySelectorAll(".blocker");
  getEnemyShips().forEach((es) => {
    const row = Number(es.attributes.currentCell.value.split("-")[0]);
    const col = Number(es.attributes.currentCell.value.split("-")[1]);
    const enemyShip = es.parentElement.removeChild(es);
    const newCell =
      direction === "hor"
        ? row + "-" + (col + distance)
        : row + distance + "-" + col;
    enemyShip.attributes.currentCell.value = newCell;

    const newCellElement = document.getElementById("cell-" + newCell);
    if (newCellElement) {
      newCellElement.appendChild(enemyShip);
    }

    // Remove blockers that enemies pass through
    blockers.forEach((blocker) => {
      if (collides(blocker, es)) {
        blocker.classList.remove("blocker");
      }
    });
  });
}

/**
 * Handles enemy movement each game tick
 * @param {Object} state - Game state object with horizontalDirection and justMovedDown
 * @returns {Object} Updated state
 */
export function handleEnemyMovement(state) {
  const newState = { ...state };

  if (enemiesInColumn(String(LEFT_BOUNDARY_COL)) && !state.justMovedDown) {
    moveEnemyShips("ver", 1);
    newState.justMovedDown = true;
    newState.shipSpeed = state.shipSpeed + 1;
    newState.horizontalDirection = 1;
  } else if (enemiesInColumn(String(RIGHT_BOUNDARY_COL)) && !state.justMovedDown) {
    moveEnemyShips("ver", 1);
    newState.justMovedDown = true;
    newState.shipSpeed = state.shipSpeed + 1;
    newState.horizontalDirection = -1;
  } else {
    moveEnemyShips("hor", state.horizontalDirection);
    newState.justMovedDown = false;
  }

  return newState;
}

/**
 * Fires a laser from a randomly selected enemy ship
 * @param {HTMLElement} ship - Player's ship element
 * @param {Function} onPlayerHit - Callback when player is hit
 * @param {Function} getGameOver - Function that returns current gameOver state
 * @param {boolean} shouldReFire - Whether to continue firing after this shot
 */
export function fireComputerLaser(ship, onPlayerHit, getGameOver, shouldReFire = false) {
  if (getGameOver()) return;

  const enemies = getEnemyShips();
  if (enemies.length === 0) return;

  const laser = document.createElement("div");
  laser.classList.add("enemyLaser");

  const randomEnemy = enemies[randomIntFromInterval(0, enemies.length - 1)];
  const cell = randomEnemy.attributes.currentCell.value;
  const cellElement = document.getElementById("cell-" + cell);

  if (cellElement) {
    cellElement.appendChild(laser);
    moveComputerLaser(laser, ship, onPlayerHit, getGameOver, shouldReFire);
  }
}

/**
 * Animates the computer's laser moving downward and handles collisions
 * @param {HTMLElement} laser - The laser element to move
 * @param {HTMLElement} ship - Player's ship element
 * @param {Function} onPlayerHit - Callback when player is hit
 * @param {Function} getGameOver - Function that returns current gameOver state
 * @param {boolean} shouldReFire - Whether to fire again after this laser
 */
function moveComputerLaser(laser, ship, onPlayerHit, getGameOver, shouldReFire) {
  // Check blocker collision
  const hitBlocker = checkBlockerCollision(laser, (blocker) => {
    laser.remove();
    blocker.classList.remove("blocker");
    if (shouldReFire) {
      fireComputerLaser(ship, onPlayerHit, getGameOver, true);
    }
  });

  if (hitBlocker) return;

  // Check player collision
  if (collides(ship, laser)) {
    laser.remove();
    onPlayerHit();
    return;
  }

  // Check if laser passed player
  if (laser.offsetTop >= ship.offsetTop) {
    laser.remove();
    if (shouldReFire && !getGameOver()) {
      sleep(randomIntFromInterval(COMPUTER_REFIRE_DELAY_MIN, COMPUTER_REFIRE_DELAY_MAX))
        .then(() => fireComputerLaser(ship, onPlayerHit, getGameOver, shouldReFire));
    }
    return;
  }

  // Continue moving laser down
  sleep(COMPUTER_LASER_MOVE_DELAY).then(() => {
    if (!laser.parentElement) return; // Laser was removed

    const currentMargin = laser.style.marginTop
      ? Number(laser.style.marginTop.replace("px", ""))
      : 0;
    laser.style.marginTop = convertToPXs(currentMargin + TICK_MOVEMENT);
    moveComputerLaser(laser, ship, onPlayerHit, getGameOver, shouldReFire);
  });
}

/**
 * Handles random enemy firing based on probability
 * @param {HTMLElement} ship - Player's ship element
 * @param {Function} onPlayerHit - Callback when player is hit
 * @param {Function} getGameOver - Function that returns current gameOver state
 */
export function handleRandomFiring(ship, onPlayerHit, getGameOver) {
  if (randomIntFromInterval(1, ENEMY_FIRE_CHANCE) === 5) {
    const continuousFire = randomIntFromInterval(1, ENEMY_CONTINUOUS_FIRE_CHANCE) === 5;
    fireComputerLaser(ship, onPlayerHit, getGameOver, continuousFire);
  }
}

/**
 * Game Module
 * Handles game state, main loop, and core game logic
 */

import {
  BASE_CLOCK_SPEED,
  SPEED_MULTIPLIER,
  LOSS_ROW,
  START_GAME_DELAY,
  GAME_OVER_MODAL_DURATION,
  COMBO_THRESHOLD,
  ACCURACY_UPGRADE_THRESHOLD,
  DEFAULT_PLAYER_LASER_INTERVAL,
  DEFAULT_FIRE_COOLDOWN,
  UPGRADED_PLAYER_LASER_INTERVAL,
  UPGRADED_FIRE_COOLDOWN,
  LEVEL_SPEED_INCREASE,
  MAX_SPEED_REDUCTION
} from './constants.js';

import * as Storage from './storage.js';
import { checkLossCondition } from './collision.js';
import {
  showModal,
  showUpgradeText,
  updatePointsDisplay,
  updateHighScoreDisplay,
  updateWinsDisplay,
  updateLossesDisplay,
  updateLevelDisplay,
  setReloadButtonText,
  setPauseOverlay,
  showFireworks,
  hideFireworks,
  removeAllLasers,
  scrollToGame,
  removeStartButtonFlash,
  announceToScreenReader,
  sleep
} from './ui.js';
import {
  initializeGrid,
  initializeEnemies,
  getEnemyShips,
  handleEnemyMovement,
  handleRandomFiring,
  fireComputerLaser
} from './enemies.js';
import { createShipControlHandler } from './player.js';

/**
 * Creates and manages the game instance
 * @returns {Object} Game controller object
 */
export function createGame() {
  // ============================================
  // GAME STATE
  // ============================================

  let state = {
    canFire: true,
    gameStarted: false,
    gameOver: false,
    paused: false,
    numberOfEnemies: 0,
    destroyedEnemies: 0,
    shotsFired: 0,
    shipSpeed: 1,
    horizontalDirection: 1,
    justMovedDown: false,
    playerLaserInterval: DEFAULT_PLAYER_LASER_INTERVAL,
    cantFireInterval: DEFAULT_FIRE_COOLDOWN,
    upgradedLaser: false,
    hitsInARow: 0,
    clockSpeed: BASE_CLOCK_SPEED,
    currentPoints: Storage.getCurrentPoints(),
    currentLevel: Storage.getCurrentLevel(),
    playerLost: false,
    lastTickTime: 0,
    animationFrameId: null
  };

  const highScore = Storage.getHighScore();
  const playerWinsOnLoad = Storage.getPlayerWins();
  const playerLossesOnLoad = Storage.getPlayerLosses();

  const ship = document.getElementById("ship");

  // ============================================
  // STATE ACCESSORS
  // ============================================

  function getGameState() {
    return { ...state };
  }

  function updateGameState(updates) {
    state = { ...state, ...updates };
  }

  function isGameOver() {
    return state.gameOver;
  }

  // ============================================
  // GAME LOOP (using requestAnimationFrame)
  // ============================================

  function gameTick(timestamp) {
    if (state.gameOver) {
      return;
    }

    if (state.paused) {
      state.animationFrameId = requestAnimationFrame(gameTick);
      return;
    }

    // Calculate time since last tick
    const elapsed = timestamp - state.lastTickTime;
    const tickInterval = state.clockSpeed - SPEED_MULTIPLIER * state.shipSpeed;

    if (elapsed >= tickInterval) {
      state.lastTickTime = timestamp;

      // Handle enemy movement
      const movementResult = handleEnemyMovement({
        horizontalDirection: state.horizontalDirection,
        justMovedDown: state.justMovedDown,
        shipSpeed: state.shipSpeed
      });
      state.horizontalDirection = movementResult.horizontalDirection;
      state.justMovedDown = movementResult.justMovedDown;
      state.shipSpeed = movementResult.shipSpeed;

      // Handle random enemy firing
      handleRandomFiring(ship, handlePlayerHit, isGameOver);

      // Check for laser upgrade
      checkLaserUpgrade();

      // Check loss condition
      if (checkLossCondition(getEnemyShips(), ship, LOSS_ROW)) {
        handleLoss();
        return;
      }
    }

    // Continue the game loop
    if (!state.gameOver) {
      state.animationFrameId = requestAnimationFrame(gameTick);
    }
  }

  // ============================================
  // GAME STATE HANDLERS
  // ============================================

  function checkLaserUpgrade() {
    if (
      state.shotsFired > 0 &&
      state.shotsFired % COMBO_THRESHOLD === 0 &&
      state.destroyedEnemies / state.shotsFired > ACCURACY_UPGRADE_THRESHOLD &&
      !state.upgradedLaser
    ) {
      showUpgradeText("Laser Upgraded!");
      state.cantFireInterval = UPGRADED_FIRE_COOLDOWN;
      state.playerLaserInterval = UPGRADED_PLAYER_LASER_INTERVAL;
      state.upgradedLaser = true;
    }
  }

  function handlePlayerHit() {
    if (ship) {
      ship.remove();
    }
    handleLoss();
  }

  function handleLoss() {
    const newLosses = Storage.incrementLosses();
    updateLossesDisplay(newLosses);

    state.currentPoints = 0;
    state.currentLevel = 1;
    Storage.setCurrentPoints(0);
    Storage.resetLevel();
    updatePointsDisplay(0);
    updateLevelDisplay(1);

    state.playerLost = true;
    handleGameOver("You Lose!");
  }

  function handleEnemyDestroyed(destroyedCount) {
    if (destroyedCount === state.numberOfEnemies) {
      handleWin();
    }
  }

  function handleWin() {
    // Increment level
    const newLevel = state.currentLevel + 1;
    state.currentLevel = newLevel;
    Storage.setCurrentLevel(newLevel);

    const newWins = Storage.incrementWins();
    updateWinsDisplay(newWins);

    showFireworks();
    handleGameOver("You Win! Level " + (newLevel - 1) + " Complete!");
  }

  function handleGameOver(message) {
    state.gameOver = true;

    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }

    showModal(message, GAME_OVER_MODAL_DURATION);
    removeAllLasers();

    // Save score
    Storage.setCurrentPoints(state.currentPoints);
    if (!state.playerLost && Storage.updateHighScore(state.currentPoints)) {
      updateHighScoreDisplay(state.currentPoints);
    }

    setReloadButtonText("Play Again");
  }

  // ============================================
  // PAUSE FUNCTIONALITY
  // ============================================

  function togglePause() {
    if (!state.gameStarted || state.gameOver) return;

    state.paused = !state.paused;
    setPauseOverlay(state.paused);

    if (state.paused) {
      announceToScreenReader("Game paused. Press Escape to resume.");
    } else {
      announceToScreenReader("Game resumed.");
      state.lastTickTime = performance.now();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      togglePause();
    }
  }

  // ============================================
  // GAME INITIALIZATION
  // ============================================

  function startGame() {
    if (state.gameStarted) return;

    removeStartButtonFlash();
    scrollToGame();
    hideFireworks();

    showModal("Level " + state.currentLevel, START_GAME_DELAY);

    sleep(START_GAME_DELAY).then(() => {
      state.gameStarted = true;
      state.lastTickTime = performance.now();

      // Start the game loop
      state.animationFrameId = requestAnimationFrame(gameTick);

      // Start enemy firing
      fireComputerLaser(ship, handlePlayerHit, isGameOver, true);

      announceToScreenReader("Game started. Use arrow keys or WASD to move, Space to fire. Press Escape to pause.");
    });
  }

  function initialize() {
    // Set up the grid and enemies
    initializeGrid();
    state.numberOfEnemies = initializeEnemies();

    // Adjust clock speed based on level and carried-over points
    const levelSpeedBonus = Math.min(
      (state.currentLevel - 1) * LEVEL_SPEED_INCREASE,
      MAX_SPEED_REDUCTION
    );
    const pointsSpeedBonus = (state.currentPoints / 500) * 5;
    state.clockSpeed = BASE_CLOCK_SPEED - levelSpeedBonus - pointsSpeedBonus;

    // Set up event listeners
    const shipControlHandler = createShipControlHandler(
      state,
      getGameState,
      updateGameState,
      handleEnemyDestroyed
    );

    document.addEventListener("keydown", shipControlHandler);
    document.addEventListener("keydown", handleKeyDown);
    document.getElementById("start").addEventListener("click", startGame);
    document.getElementById("reload").addEventListener("click", () => location.reload());

    // Prevent spacebar from scrolling page
    window.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "ArrowUp") && e.target === document.body) {
        e.preventDefault();
      }
    });

    // Initialize UI displays
    updateWinsDisplay(playerWinsOnLoad);
    updateLossesDisplay(playerLossesOnLoad);
    updateHighScoreDisplay(highScore);
    updatePointsDisplay(state.currentPoints);
    updateLevelDisplay(state.currentLevel);
  }

  // Return public interface
  return {
    initialize,
    startGame,
    togglePause,
    getState: getGameState
  };
}

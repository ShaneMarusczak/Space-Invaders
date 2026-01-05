/**
 * Space Invaders - Main Entry Point
 * Initializes the game when the DOM is ready
 */

import { createGame } from './modules/game.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = createGame();
  game.initialize();

  // Expose game instance for debugging (optional)
  if (typeof window !== 'undefined') {
    window.spaceInvadersGame = game;
  }
});

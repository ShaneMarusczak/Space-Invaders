/**
 * Game Constants Module
 * Central configuration for all game parameters
 */

// ============================================
// GRID CONFIGURATION
// ============================================

/** Number of rows in the game grid */
export const GRID_ROWS = 32;

/** Number of columns in the game grid */
export const GRID_COLS = 50;

/** Row at which enemies trigger a loss condition */
export const LOSS_ROW = 30;

/** Column boundaries for enemy direction change */
export const LEFT_BOUNDARY_COL = 0;
export const RIGHT_BOUNDARY_COL = 46;

// ============================================
// MOVEMENT AND POSITIONING
// ============================================

/** Pixels moved per tick/keypress */
export const TICK_MOVEMENT = 25;

/** Ship width offset for boundary checking */
export const SHIP_WIDTH_OFFSET = 100;

/** Laser positioning offsets */
export const LASER_VERTICAL_OFFSET = 30;
export const LASER_INITIAL_OFFSET = 50;
export const PLAYER_LASER_LEFT_OFFSET = 45;

// ============================================
// TIMING CONSTANTS (milliseconds)
// ============================================

/** Duration of the points flash animation */
export const POINTS_FLASH_DURATION = 750;

/** Delay before game starts after clicking Start */
export const START_GAME_DELAY = 1500;

/** Duration of game over modal display */
export const GAME_OVER_MODAL_DURATION = 2000;

/** Duration of upgrade text display */
export const UPGRADE_TEXT_DURATION = 4000;

/** Delay between computer laser movements */
export const COMPUTER_LASER_MOVE_DELAY = 200;

/** Range for computer refire delay */
export const COMPUTER_REFIRE_DELAY_MIN = 350;
export const COMPUTER_REFIRE_DELAY_MAX = 550;

// ============================================
// PLAYER LASER TIMING
// ============================================

/** Default interval between laser movement steps */
export const DEFAULT_PLAYER_LASER_INTERVAL = 175;

/** Default cooldown between player shots */
export const DEFAULT_FIRE_COOLDOWN = 550;

/** Upgraded laser movement interval */
export const UPGRADED_PLAYER_LASER_INTERVAL = 150;

/** Upgraded fire cooldown */
export const UPGRADED_FIRE_COOLDOWN = 500;

// ============================================
// GAME SPEED
// ============================================

/** Base game tick speed */
export const BASE_CLOCK_SPEED = 375;

/** Multiplier for speed increase per descent */
export const SPEED_MULTIPLIER = 16;

// ============================================
// SCORING AND UPGRADES
// ============================================

/** Number of hits for combo multiplier increase */
export const COMBO_THRESHOLD = 10;

/** Accuracy required for laser upgrade (65%) */
export const ACCURACY_UPGRADE_THRESHOLD = 0.65;

// ============================================
// ENEMY BEHAVIOR
// ============================================

/** 1 in X chance for enemy to fire each tick */
export const ENEMY_FIRE_CHANCE = 10;

/** 1 in X chance for continuous fire mode */
export const ENEMY_CONTINUOUS_FIRE_CHANCE = 15;

/** Number of movement steps for player laser */
export const PLAYER_LASER_ITERATIONS = 28;

// ============================================
// ENEMY SPAWN CONFIGURATION
// ============================================

/** Number of enemy rows */
export const ENEMY_ROWS = 4;

/** Number of enemies per row */
export const ENEMIES_PER_ROW = 7;

/** Vertical spacing between enemy rows (in grid cells) */
export const ENEMY_ROW_SPACING = 3;

/** Horizontal spacing between enemies (in grid cells) */
export const ENEMY_COL_SPACING = 6;

// ============================================
// SHIELD CONFIGURATION
// ============================================

/** Shield row definitions */
export const SHIELD_ROWS = {
  /** Rows 25-26: main body of shields */
  mainRows: [25, 26],
  /** Row 27: bottom corners only */
  bottomRow: 27
};

/** Shield column groups (5 shields, each 5 columns wide) */
export const SHIELD_COLUMN_GROUPS = [
  [2, 3, 4, 5, 6],
  [12, 13, 14, 15, 16],
  [22, 23, 24, 25, 26],
  [32, 33, 34, 35, 36],
  [42, 43, 44, 45, 46]
];

/** Corner columns to exclude from row 25 (creates arch shape) */
export const SHIELD_CORNER_COLS = [2, 6, 12, 16, 22, 26, 32, 36, 42, 46];

// ============================================
// ASSETS
// ============================================

/** Enemy ship images by row */
export const IMAGE_STORE = [
  "images/enemy-4.png",
  "images/enemy-2.png",
  "images/enemy-3.png",
  "images/enemy-1.png",
];

// ============================================
// LEVEL CONFIGURATION
// ============================================

/** Speed increase per level (lower = faster) */
export const LEVEL_SPEED_INCREASE = 25;

/** Maximum speed reduction from base */
export const MAX_SPEED_REDUCTION = 200;

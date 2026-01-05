"use strict";
(() => {
  // ============================================
  // GAME CONSTANTS
  // ============================================

  /** Grid dimensions */
  const GRID_ROWS = 32;
  const GRID_COLS = 50;

  /** Row at which enemies trigger a loss condition */
  const LOSS_ROW = 30;

  /** Column boundaries for enemy direction change */
  const LEFT_BOUNDARY_COL = 0;
  const RIGHT_BOUNDARY_COL = 46;

  /** Movement and positioning */
  const TICK_MOVEMENT = 25;
  const SHIP_WIDTH_OFFSET = 100;
  const LASER_VERTICAL_OFFSET = 30;
  const LASER_INITIAL_OFFSET = 50;
  const PLAYER_LASER_LEFT_OFFSET = 45;

  /** Timing constants (in milliseconds) */
  const POINTS_FLASH_DURATION = 750;
  const START_GAME_DELAY = 1500;
  const GAME_OVER_MODAL_DURATION = 2000;
  const UPGRADE_TEXT_DURATION = 4000;
  const COMPUTER_LASER_MOVE_DELAY = 200;
  const COMPUTER_REFIRE_DELAY_MIN = 350;
  const COMPUTER_REFIRE_DELAY_MAX = 550;

  /** Default timing values (can be upgraded) */
  const DEFAULT_PLAYER_LASER_INTERVAL = 175;
  const DEFAULT_FIRE_COOLDOWN = 550;
  const UPGRADED_PLAYER_LASER_INTERVAL = 150;
  const UPGRADED_FIRE_COOLDOWN = 500;

  /** Game tick and speed */
  const BASE_CLOCK_SPEED = 375;
  const SPEED_MULTIPLIER = 16;

  /** Scoring */
  const COMBO_THRESHOLD = 10;
  const ACCURACY_UPGRADE_THRESHOLD = 0.65;
  const COOKIE_EXPIRY_DAYS = 10;

  /** Enemy firing probability */
  const ENEMY_FIRE_CHANCE = 10;
  const ENEMY_CONTINUOUS_FIRE_CHANCE = 15;

  /** Player laser flight iterations */
  const PLAYER_LASER_ITERATIONS = 28;

  /** Enemy spawn configuration */
  const ENEMY_ROWS = 4;
  const ENEMIES_PER_ROW = 7;
  const ENEMY_ROW_SPACING = 3;
  const ENEMY_COL_SPACING = 6;

  /** Shield (blocker) pattern definition */
  const SHIELD_ROWS = {
    /** Rows 25-26: main body of shields */
    mainRows: [25, 26],
    /** Row 27: bottom corners only */
    bottomRow: 27
  };

  /** Shield column groups (5 shields, each 5 columns wide) */
  const SHIELD_COLUMN_GROUPS = [
    [2, 3, 4, 5, 6],
    [12, 13, 14, 15, 16],
    [22, 23, 24, 25, 26],
    [32, 33, 34, 35, 36],
    [42, 43, 44, 45, 46]
  ];

  /** Corner columns to exclude from row 25 (creates arch shape) */
  const SHIELD_CORNER_COLS = [2, 6, 12, 16, 22, 26, 32, 36, 42, 46];

  /** Enemy ship images */
  const IMAGE_STORE = [
    "images/enemy-4.png",
    "images/enemy-2.png",
    "images/enemy-3.png",
    "images/enemy-1.png",
  ];

  // ============================================
  // GAME STATE
  // ============================================

  let canFire = true;
  let gameStarted = false;
  let gameOver = false;
  let numberOfEnemies = 0;
  let destroyedEnemies = 0;
  let shotsFired = 0;
  let shipSpeed = 1;
  let horizontalDirection = 1;
  let justMovedDown = false;
  let playerLaserInterval = DEFAULT_PLAYER_LASER_INTERVAL;
  let cantFireInterval = DEFAULT_FIRE_COOLDOWN;
  let upgradedLaser = false;
  let hitsInARow = 0;
  let clockSpeed = BASE_CLOCK_SPEED;
  let currentPoints = Number(getCookie("currentPointsSpace"));
  let playerLost = false;

  const highScore = Number(getCookie("highScoreSpace"));
  const playerWinsOnLoad = Number(getCookie("playerWinsSpace"));
  const playerLossesOnLoad = Number(getCookie("playerLossesSpace"));

  const ship = document.getElementById("ship");
  const gameBoard = document.getElementById("gameBoard");

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Returns a collection of all enemy ship elements currently in the DOM
   * @returns {HTMLElement[]} Array of enemy ship elements
   */
  const enemyShips = () =>
    Array.from(document.getElementsByClassName("enemyShip"));

  /**
   * Converts a number to a CSS pixel value string
   * @param {number} num - The number to convert
   * @returns {string} The number with 'px' appended
   */
  const convertToPXs = (num) => num + "px";

  /**
   * Returns a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer in range [min, max]
   */
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Returns a Promise that resolves after the specified delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>} Promise that resolves after delay
   */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // COOKIE FUNCTIONS
  // ============================================

  /**
   * Sets a cookie with the specified name, value, and expiry
   * @param {string} cname - Cookie name
   * @param {string|number} cvalue - Cookie value
   * @param {number} exdays - Number of days until expiry
   */
  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie =
      cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
  }

  /**
   * Retrieves a cookie value by name
   * @param {string} cname - Cookie name to retrieve
   * @returns {string} Cookie value or empty string if not found
   */
  function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  // ============================================
  // COLLISION DETECTION
  // ============================================

  /**
   * Performs Axis-Aligned Bounding Box (AABB) collision detection
   * between two DOM elements
   * @param {HTMLElement} obj1 - First element to check
   * @param {HTMLElement} obj2 - Second element to check
   * @returns {boolean} True if the elements overlap, false otherwise
   */
  const collides = (obj1, obj2) =>
    !(
      obj2.offsetLeft > obj1.offsetWidth + obj1.offsetLeft ||
      obj1.offsetLeft > obj2.offsetWidth + obj2.offsetLeft ||
      obj2.offsetTop > obj1.offsetHeight + obj1.offsetTop ||
      obj1.offsetTop > obj2.offsetHeight + obj2.offsetTop
    );

  // ============================================
  // UI FUNCTIONS
  // ============================================

  /**
   * Displays a modal message overlay for a specified duration
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the modal (in ms)
   */
  function modal(message, duration) {
    const modalBox = document.createElement("div");
    modalBox.id = "modal-box";
    const innerModalBox = document.createElement("div");
    innerModalBox.id = "inner-modal-box";
    const modalMessage = document.createElement("span");
    modalMessage.id = "modal-message";
    innerModalBox.appendChild(modalMessage);
    modalBox.appendChild(innerModalBox);
    modalMessage.innerText = message;
    document.getElementsByTagName("html")[0].appendChild(modalBox);
    sleep(duration).then(() => modalBox.remove());
  }

  /**
   * Displays upgrade notification text that fades after a delay
   * @param {string} message - The upgrade message to display
   */
  function upgradeTextControl(message) {
    const upgradeText = document.getElementById("upgradeText");
    upgradeText.textContent = message;
    sleep(UPGRADE_TEXT_DURATION).then(() => {
      upgradeText.textContent = "";
    });
  }

  // ============================================
  // PLAYER CONTROLS
  // ============================================

  /**
   * Handles keyboard input for player ship movement and firing
   * @param {KeyboardEvent} e - The keyboard event
   */
  function shipControl(e) {
    if (gameStarted && !gameOver) {
      const posLeft = ship.offsetLeft - gameBoard.offsetLeft - 1;
      if (
        (e.key === "ArrowLeft" || e.key === "a") &&
        posLeft - TICK_MOVEMENT >= 0
      ) {
        e.preventDefault();
        ship.style.marginLeft = convertToPXs(posLeft - TICK_MOVEMENT);
      } else if (
        (e.key === "ArrowRight" || e.key === "d") &&
        posLeft + TICK_MOVEMENT <= gameBoard.offsetWidth - SHIP_WIDTH_OFFSET
      ) {
        e.preventDefault();
        ship.style.marginLeft = convertToPXs(posLeft + TICK_MOVEMENT);
      } else if (
        (e.key === " " || e.key === "ArrowUp" || e.key === "w") &&
        canFire
      ) {
        e.preventDefault();
        shotsFired++;
        canFire = false;
        sleep(cantFireInterval).then(() => {
          canFire = true;
        });
        firePlayerLaser();
      }
    }
  }

  // ============================================
  // PLAYER LASER SYSTEM
  // ============================================

  /**
   * Creates and fires a laser from the player's ship.
   * The laser travels upward, checking for collisions with
   * blockers and enemy ships at each step.
   */
  function firePlayerLaser() {
    const laser = document.createElement("div");
    laser.classList.add("laser");
    laser.style.left = convertToPXs(ship.offsetLeft + PLAYER_LASER_LEFT_OFFSET);
    laser.style.top = convertToPXs(ship.offsetTop - LASER_VERTICAL_OFFSET);
    ship.appendChild(laser);

    for (let i = 0; i < PLAYER_LASER_ITERATIONS; i++) {
      sleep(i * playerLaserInterval).then(() => {
        laser.style.top = convertToPXs(
          ship.offsetTop - LASER_INITIAL_OFFSET - TICK_MOVEMENT * i
        );
        checkPlayerLaserBlockerCollision(laser);
        checkPlayerLaserEnemyCollision(laser);
      });
    }

    // Remove laser after flight completes (missed all targets)
    sleep(PLAYER_LASER_ITERATIONS * playerLaserInterval).then(() => {
      if (laser.parentElement) {
        hitsInARow = 0;
        laser.remove();
      }
    });
  }

  /**
   * Checks if the player's laser has hit any blocker shields
   * @param {HTMLElement} laser - The laser element to check
   */
  function checkPlayerLaserBlockerCollision(laser) {
    document.querySelectorAll(".blocker").forEach((blocker) => {
      if (collides(blocker, laser)) {
        laser.remove();
        blocker.classList.remove("blocker");
      }
    });
  }

  /**
   * Checks if the player's laser has hit any enemy ships
   * @param {HTMLElement} laser - The laser element to check
   */
  function checkPlayerLaserEnemyCollision(laser) {
    enemyShips().forEach((es) => {
      if (collides(es, laser)) {
        enemyShipHitHandler(es, laser);
      }
    });
  }

  /**
   * Handles the destruction of an enemy ship when hit by player laser.
   * Updates score, checks for combo bonuses, and handles win condition.
   * @param {HTMLElement} es - The enemy ship element that was hit
   * @param {HTMLElement} laser - The laser element that hit the enemy
   */
  function enemyShipHitHandler(es, laser) {
    laser.remove();
    es.remove();
    destroyedEnemies++;
    hitsInARow++;

    // Calculate points with combo multiplier
    const comboMultiplier = Math.floor(hitsInARow / COMBO_THRESHOLD) + 1;
    currentPoints += comboMultiplier * Number(es.attributes.points.value);

    // Flash points display
    document.getElementById("winLoss").classList.add("pointsFlash");
    sleep(POINTS_FLASH_DURATION).then(() =>
      document.getElementById("winLoss").classList.remove("pointsFlash")
    );
    document.getElementById("points").textContent = currentPoints;

    // Bonus: enemies retreat on combo threshold
    if (hitsInARow % COMBO_THRESHOLD === 0) {
      upgradeTextControl("The Enemy Retreats!");
      moveEnemyShips("ver", -1);
    }

    // Check win condition
    if (destroyedEnemies === numberOfEnemies) {
      gameOverHandler("You Win!");
      setCookie("playerWinsSpace", playerWinsOnLoad + 1, COOKIE_EXPIRY_DAYS);
      document.getElementById("playerWins").textContent = playerWinsOnLoad + 1;
      document.getElementById("myCanvas").style.display = "block";
    }
  }

  // ============================================
  // COMPUTER LASER SYSTEM
  // ============================================

  /**
   * Fires a laser from a randomly selected enemy ship
   * @param {boolean} shouldReFire - Whether to continue firing after this shot
   */
  function fireComputerLaser(shouldReFire) {
    if (!gameOver) {
      const laser = document.createElement("div");
      const ess = enemyShips();
      laser.classList.add("enemyLaser");
      const cell =
        ess[randomIntFromInterval(0, ess.length - 1)].attributes.currentCell
          .value;
      document.getElementById("cell-" + cell).appendChild(laser);
      moveComputerLaser(laser, shouldReFire);
    }
  }

  /**
   * Animates the computer's laser moving downward and handles collisions
   * @param {HTMLElement} laser - The laser element to move
   * @param {boolean} shouldReFire - Whether to fire again after this laser
   */
  function moveComputerLaser(laser, shouldReFire) {
    // Check blocker collision
    let hitBlocker = false;
    document.querySelectorAll(".blocker").forEach((blocker) => {
      if (collides(blocker, laser)) {
        laser.remove();
        blocker.classList.remove("blocker");
        if (shouldReFire) {
          fireComputerLaser(true);
        }
        hitBlocker = true;
      }
    });
    if (hitBlocker) {
      return;
    }

    // Check player collision
    if (collides(ship, laser)) {
      ship.remove();
      laser.remove();
      lossHandler();
    } else if (laser.offsetTop >= ship.offsetTop) {
      // Laser missed - went past player
      laser.remove();
      if (shouldReFire && !gameOver) {
        sleep(
          randomIntFromInterval(COMPUTER_REFIRE_DELAY_MIN, COMPUTER_REFIRE_DELAY_MAX)
        ).then(() => {
          fireComputerLaser(shouldReFire);
        });
      }
    } else {
      // Continue moving laser down
      sleep(COMPUTER_LASER_MOVE_DELAY).then(() => {
        laser.style.marginTop = convertToPXs(
          Number(
            laser.style.marginTop.substring(0, laser.style.marginTop.length - 2)
          ) + TICK_MOVEMENT
        );
        moveComputerLaser(laser, shouldReFire);
      });
    }
  }

  // ============================================
  // ENEMY MOVEMENT
  // ============================================

  /**
   * Checks if any enemy ships are in the specified column
   * @param {string} col - Column number as string
   * @returns {boolean} True if any enemies are in that column
   */
  const enemiesInColumn = (col) =>
    enemyShips().some(
      (es) => es.attributes.currentCell.value.split("-")[1] === col
    );

  /**
   * Helper function to handle enemy direction change and downward movement
   * @param {number} newHorizontalDirection - New direction (1 for right, -1 for left)
   */
  const moveDownHelper = (newHorizontalDirection) => {
    moveEnemyShips("ver", 1);
    justMovedDown = true;
    shipSpeed++;
    horizontalDirection = newHorizontalDirection;
  };

  /**
   * Moves all enemy ships in the specified direction
   * @param {string} direction - "hor" for horizontal, "ver" for vertical
   * @param {number} distance - Number of cells to move (positive or negative)
   */
  function moveEnemyShips(direction, distance) {
    const blockers = document.querySelectorAll(".blocker");
    enemyShips().forEach((es) => {
      const row = Number(es.attributes.currentCell.value.split("-")[0]);
      const col = Number(es.attributes.currentCell.value.split("-")[1]);
      const enemyShip = es.parentElement.removeChild(es);
      const newCell =
        direction === "hor"
          ? row + "-" + (col + distance)
          : row + distance + "-" + col;
      enemyShip.attributes.currentCell.value = newCell;
      document.getElementById("cell-" + newCell).appendChild(enemyShip);

      // Remove blockers that enemies pass through
      blockers.forEach((blocker) => {
        if (collides(blocker, es)) {
          blocker.classList.remove("blocker");
        }
      });
    });
  }

  // ============================================
  // GAME LOOP
  // ============================================

  /**
   * Handles enemy ship movement logic each game tick.
   * Enemies move horizontally until hitting a boundary, then move down.
   */
  function handleEnemyMovement() {
    if (
      enemiesInColumn(String(LEFT_BOUNDARY_COL)) &&
      !justMovedDown
    ) {
      moveDownHelper(1);
    } else if (
      enemiesInColumn(String(RIGHT_BOUNDARY_COL)) &&
      !justMovedDown
    ) {
      moveDownHelper(-1);
    } else {
      moveEnemyShips("hor", horizontalDirection);
      justMovedDown = false;
    }
  }

  /**
   * Handles random enemy firing with configurable probability.
   * Has a chance to trigger continuous firing mode.
   */
  function handleRandomFiring() {
    if (randomIntFromInterval(1, ENEMY_FIRE_CHANCE) === 5) {
      const continuousFire =
        randomIntFromInterval(1, ENEMY_CONTINUOUS_FIRE_CHANCE) === 5;
      fireComputerLaser(continuousFire);
    }
  }

  /**
   * Checks if conditions are met to upgrade the player's laser.
   * Requires 65%+ accuracy after every 10 shots.
   */
  function checkLaserUpgrade() {
    if (
      shotsFired % COMBO_THRESHOLD === 0 &&
      destroyedEnemies / shotsFired > ACCURACY_UPGRADE_THRESHOLD &&
      !upgradedLaser
    ) {
      upgradeTextControl("Laser Upgraded!");
      cantFireInterval = UPGRADED_FIRE_COOLDOWN;
      playerLaserInterval = UPGRADED_PLAYER_LASER_INTERVAL;
      upgradedLaser = true;
    }
  }

  /**
   * Main game loop tick. Handles enemy movement, firing, upgrades,
   * and loss condition checking. Recursively schedules the next tick.
   */
  function gameTick() {
    if (!gameOver) {
      handleEnemyMovement();
      handleRandomFiring();
      checkLaserUpgrade();
      lossChecker();

      if (!gameOver) {
        sleep(clockSpeed - SPEED_MULTIPLIER * shipSpeed).then(() => gameTick());
      }
    }
  }

  // ============================================
  // GAME STATE HANDLERS
  // ============================================

  /**
   * Checks if any enemy has reached the loss condition (bottom row or collision)
   */
  function lossChecker() {
    if (
      enemyShips().some(
        (es) =>
          collides(es, ship) ||
          es.attributes.currentCell.value.split("-")[0] === String(LOSS_ROW)
      )
    ) {
      lossHandler();
    }
  }

  /**
   * Handles the player losing the game.
   * Updates stats, resets points, and displays loss message.
   */
  function lossHandler() {
    setCookie("playerLossesSpace", playerLossesOnLoad + 1, COOKIE_EXPIRY_DAYS);
    document.getElementById("playerLosses").textContent =
      playerLossesOnLoad + 1;
    currentPoints = 0;
    setCookie("currentPointsSpace", 0, COOKIE_EXPIRY_DAYS);
    document.getElementById("points").textContent = 0;
    playerLost = true;
    gameOverHandler("You Lose!");
  }

  /**
   * Handles end of game (win or loss).
   * Cleans up lasers, saves score, and displays message.
   * @param {string} message - The game over message to display
   */
  function gameOverHandler(message) {
    gameOver = true;
    modal(message, GAME_OVER_MODAL_DURATION);

    // Clean up all lasers
    Array.from(document.getElementsByClassName("laser")).forEach((l) =>
      l.remove()
    );
    Array.from(document.getElementsByClassName("enemyLaser")).forEach((l) =>
      l.remove()
    );

    // Save score
    setCookie("currentPointsSpace", currentPoints, COOKIE_EXPIRY_DAYS);
    if (currentPoints > highScore && !playerLost) {
      setCookie("highScoreSpace", currentPoints, COOKIE_EXPIRY_DAYS);
      document.getElementById("highScore").textContent = currentPoints;
    }
    document.getElementById("reload").textContent = "Play Again";
  }

  /**
   * Starts the game when the start button is clicked
   */
  function startGame() {
    if (!gameStarted) {
      document.getElementById("start").classList.remove("startButtonFlash");
      document.getElementById("winLoss").scrollIntoView();
      modal("Start!", START_GAME_DELAY);
      sleep(START_GAME_DELAY).then(() => {
        gameStarted = true;
        gameTick();
        fireComputerLaser(true);
      });
    }
  }

  // ============================================
  // GRID INITIALIZATION
  // ============================================

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
  function initializeGrid() {
    for (let i = 0; i < GRID_ROWS; i++) {
      const shipRow = document.createElement("div");
      document.getElementById("enemies").appendChild(shipRow);
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
   */
  function initializeEnemies() {
    for (let i = 1; i <= ENEMY_ROWS; i++) {
      const shipImgToUse = IMAGE_STORE[i - 1];
      for (let j = 1; j <= ENEMIES_PER_ROW; j++) {
        const enemyShip = document.createElement("div");
        const shipImg = document.createElement("img");
        shipImg.src = shipImgToUse;
        shipImg.classList.add("enemyShipImg");
        enemyShip.appendChild(shipImg);
        enemyShip.classList.add("enemyShip");

        const row = ENEMY_ROW_SPACING * i;
        const col = ENEMY_COL_SPACING * j;
        const cellId = row + "-" + col;

        document.getElementById("cell-" + cellId).appendChild(enemyShip);
        enemyShip.setAttribute("currentCell", cellId);
        // Points: 50, 40, 30, 20 based on row (higher rows worth more)
        enemyShip.setAttribute("points", -10 * i + 60);
        numberOfEnemies++;
      }
    }
  }

  /**
   * Sets up event listeners and initializes UI elements
   */
  function initializeUI() {
    document.addEventListener("keydown", shipControl);
    document.getElementById("start").addEventListener("click", startGame);
    document.getElementById("playerWins").textContent = playerWinsOnLoad;
    document.getElementById("playerLosses").textContent = playerLossesOnLoad;
    document.getElementById("highScore").textContent = highScore;
    document.getElementById("points").textContent = currentPoints;

    // Adjust clock speed based on carried-over points
    clockSpeed = clockSpeed - (currentPoints / 500) * 5;

    // Prevent spacebar from scrolling page
    window.onkeydown = (e) =>
      !((e.key === " " || e.key === "ArrowUp") && e.target === document.body);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  (() => {
    initializeGrid();
    initializeEnemies();
    initializeUI();
  })();
})();

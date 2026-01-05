/**
 * Fireworks Animation Module
 * Displays celebratory fireworks on victory
 */

"use strict";

(() => {
  // ============================================
  // CONSTANTS
  // ============================================

  /** Maximum number of concurrent fireworks */
  const MAX_FIREWORKS = 5;

  /** Number of sparks per firework */
  const MAX_SPARKS = 50;

  /** Age at which firework can reset */
  const RESET_AGE = 100;

  /** Probability of reset after reaching reset age */
  const RESET_PROBABILITY = 0.05;

  /** Height at which flying firework explodes */
  const EXPLOSION_HEIGHT = 200;

  /** Probability of early explosion */
  const EARLY_EXPLOSION_PROBABILITY = 0.001;

  /** Speed of firework rising */
  const RISE_SPEED = 10;

  /** Size of spark particles */
  const PARTICLE_SIZE = 4;

  /** Number of trail particles when flying */
  const TRAIL_PARTICLES = 15;

  /** Number of trail segments when exploding */
  const EXPLOSION_TRAIL_LENGTH = 10;

  // ============================================
  // CANVAS SETUP
  // ============================================

  const canvas = document.getElementById("myCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const fireworks = [];

  // ============================================
  // FIREWORK INITIALIZATION
  // ============================================

  /**
   * Resets a firework to its initial flying state
   * @param {Object} firework - The firework object to reset
   */
  function resetFirework(firework) {
    firework.x = Math.floor(Math.random() * canvas.width);
    firework.y = canvas.height;
    firework.age = 0;
    firework.phase = "fly";
  }

  /**
   * Creates a single spark particle
   * @returns {Object} Spark object with velocity and color properties
   */
  function createSpark() {
    const spark = {
      // Random color channels (0 or 1 for RGB)
      red: Math.floor(Math.random() * 2),
      green: Math.floor(Math.random() * 2),
      blue: Math.floor(Math.random() * 2),
      // Velocity
      vx: Math.random() * 5 + 0.5,
      vy: Math.random() * 5 + 0.5,
      // Gravity weight
      weight: Math.random() * 0.3 + 0.03,
    };

    // Randomize direction
    if (Math.random() > 0.5) spark.vx = -spark.vx;
    if (Math.random() > 0.5) spark.vy = -spark.vy;

    return spark;
  }

  /**
   * Creates a new firework with its sparks
   * @returns {Object} Firework object
   */
  function createFirework() {
    const firework = {
      sparks: [],
      x: 0,
      y: 0,
      age: 0,
      phase: "fly"
    };

    for (let i = 0; i < MAX_SPARKS; i++) {
      firework.sparks.push(createSpark());
    }

    return firework;
  }

  // Initialize fireworks
  for (let i = 0; i < MAX_FIREWORKS; i++) {
    const firework = createFirework();
    fireworks.push(firework);
    resetFirework(firework);
  }

  // ============================================
  // ANIMATION
  // ============================================

  /**
   * Draws a single frame of the fireworks animation
   */
  function explode() {
    // Only animate if canvas is visible
    if (canvas.style.display === "none") {
      requestAnimationFrame(explode);
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((firework, index) => {
      if (firework.phase === "explode") {
        // Draw explosion
        drawExplosion(firework);
        firework.age++;

        // Reset after explosion fades
        if (firework.age > RESET_AGE && Math.random() < RESET_PROBABILITY) {
          resetFirework(firework);
        }
      } else {
        // Draw rising firework
        drawRisingFirework(firework, index);
        firework.y -= RISE_SPEED;

        // Trigger explosion
        if (Math.random() < EARLY_EXPLOSION_PROBABILITY || firework.y < EXPLOSION_HEIGHT) {
          firework.phase = "explode";
        }
      }
    });

    requestAnimationFrame(explode);
  }

  /**
   * Draws an exploding firework
   * @param {Object} firework - The firework to draw
   */
  function drawExplosion(firework) {
    firework.sparks.forEach((spark) => {
      for (let i = 0; i < EXPLOSION_TRAIL_LENGTH; i++) {
        const trailAge = firework.age + i;
        const x = firework.x + spark.vx * trailAge;
        const y = firework.y + spark.vy * trailAge +
          spark.weight * trailAge * spark.weight * trailAge;

        const fade = i * 20 - firework.age * 2;
        const r = Math.floor(spark.red * fade);
        const g = Math.floor(spark.green * fade);
        const b = Math.floor(spark.blue * fade);

        context.beginPath();
        context.fillStyle = `rgba(${r},${g},${b},1)`;
        context.rect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
        context.fill();
      }
    });
  }

  /**
   * Draws a rising firework with trail
   * @param {Object} firework - The firework to draw
   * @param {number} index - Index for color variation
   */
  function drawRisingFirework(firework, index) {
    for (let spark = 0; spark < TRAIL_PARTICLES; spark++) {
      context.beginPath();
      context.fillStyle = `rgba(${index * 50},${spark * 17},0,1)`;
      context.rect(
        firework.x + Math.random() * spark - spark / 2,
        firework.y + spark * 4,
        PARTICLE_SIZE,
        PARTICLE_SIZE
      );
      context.fill();
    }
  }

  // Start animation loop
  requestAnimationFrame(explode);
})();

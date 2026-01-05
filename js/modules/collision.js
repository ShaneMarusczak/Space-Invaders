/**
 * Collision Detection Module
 * Handles all collision detection logic
 */

/**
 * Performs Axis-Aligned Bounding Box (AABB) collision detection
 * between two DOM elements
 * @param {HTMLElement} obj1 - First element to check
 * @param {HTMLElement} obj2 - Second element to check
 * @returns {boolean} True if the elements overlap, false otherwise
 */
export function collides(obj1, obj2) {
  if (!obj1 || !obj2) return false;

  return !(
    obj2.offsetLeft > obj1.offsetWidth + obj1.offsetLeft ||
    obj1.offsetLeft > obj2.offsetWidth + obj2.offsetLeft ||
    obj2.offsetTop > obj1.offsetHeight + obj1.offsetTop ||
    obj1.offsetTop > obj2.offsetHeight + obj2.offsetTop
  );
}

/**
 * Checks if a laser collides with any blocker shields
 * @param {HTMLElement} laser - The laser element
 * @param {Function} onCollide - Callback when collision occurs (receives blocker element)
 * @returns {boolean} True if collision occurred
 */
export function checkBlockerCollision(laser, onCollide) {
  let hit = false;
  document.querySelectorAll(".blocker").forEach((blocker) => {
    if (collides(blocker, laser)) {
      hit = true;
      if (onCollide) onCollide(blocker);
    }
  });
  return hit;
}

/**
 * Checks if a laser collides with any enemy ships
 * @param {HTMLElement} laser - The laser element
 * @param {HTMLElement[]} enemies - Array of enemy ship elements
 * @param {Function} onCollide - Callback when collision occurs (receives enemy element)
 * @returns {boolean} True if collision occurred
 */
export function checkEnemyCollision(laser, enemies, onCollide) {
  let hit = false;
  enemies.forEach((enemy) => {
    if (collides(enemy, laser)) {
      hit = true;
      if (onCollide) onCollide(enemy);
    }
  });
  return hit;
}

/**
 * Checks if any enemy has collided with the player or reached the loss row
 * @param {HTMLElement[]} enemies - Array of enemy ship elements
 * @param {HTMLElement} playerShip - The player's ship element
 * @param {number} lossRow - The row number that triggers a loss
 * @returns {boolean} True if loss condition is met
 */
export function checkLossCondition(enemies, playerShip, lossRow) {
  return enemies.some(
    (enemy) =>
      collides(enemy, playerShip) ||
      enemy.attributes.currentCell.value.split("-")[0] === String(lossRow)
  );
}

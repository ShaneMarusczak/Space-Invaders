"use strict";
(() => {
  let canFire = true;
  let gameStarted = false;
  let gameOver = false;
  let numberOfEnemies = 0;
  let destroyedEnemies = 0;
  let shotsFired = 0;
  let shipSpeed = 1;
  let horizontalDirection = 1;
  let justMovedDown = false;
  let playerLaserInterval = 175;
  let cantFireInterval = 550;
  let upgradedLaser = false;
  let hitsInARow = 0;
  let clockSpeed = 375;
  let currentPoints = Number(getCookie("currentPointsSpace"));
  let playerLost = false;
  const highScore = Number(getCookie("highScoreSpace"));
  const playerWinsOnLoad = Number(getCookie("playerWinsSpace"));
  const playerLossesOnLoad = Number(getCookie("playerLossesSpace"));
  const playerLaserIterations = 28;
  const tickMovement = 25;
  const imageStore = [
    "images/enemy-4.png",
    "images/enemy-2.png",
    "images/enemy-3.png",
    "images/enemy-1.png",
  ];
  const ship = document.getElementById("ship");
  const gameBoard = document.getElementById("gameBoard");

  const enemyShips = () =>
    Array.from(document.getElementsByClassName("enemyShip"));

  const convertToPXs = (num) => num + "px";

  function shipControl(e) {
    if (gameStarted && !gameOver) {
      const posLeft = ship.offsetLeft - gameBoard.offsetLeft - 1;
      if (
        (e.key === "ArrowLeft" || e.key === "a") &&
        posLeft - tickMovement >= 0
      ) {
        e.preventDefault();
        ship.style.marginLeft = convertToPXs(posLeft - tickMovement);
      } else if (
        (e.key === "ArrowRight" || e.key === "d") &&
        posLeft + tickMovement <= gameBoard.offsetWidth - 100
      ) {
        e.preventDefault();
        ship.style.marginLeft = convertToPXs(posLeft + tickMovement);
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

  const colides = (obj1, obj2) =>
    !(
      obj2.offsetLeft > obj1.offsetWidth + obj1.offsetLeft ||
      obj1.offsetLeft > obj2.offsetWidth + obj2.offsetLeft ||
      obj2.offsetTop > obj1.offsetHeight + obj1.offsetTop ||
      obj1.offsetTop > obj2.offsetHeight + obj2.offsetTop
    );

  function firePlayerLaser() {
    const laser = document.createElement("div");
    laser.classList.add("laser");
    laser.style.left = convertToPXs(ship.offsetLeft + 45);
    laser.style.top = convertToPXs(ship.offsetTop - 30);
    ship.appendChild(laser);
    for (let i = 0; i < playerLaserIterations; i++) {
      sleep(i * playerLaserInterval).then(() => {
        laser.style.top = convertToPXs(
          ship.offsetTop - tickMovement * 2 - tickMovement * i
        );
        document.querySelectorAll(".blocker").forEach((blocker) => {
          if (colides(blocker, laser)) {
            laser.remove();
            blocker.classList.remove("blocker");
          }
        });

        enemyShips().forEach((es) => {
          if (colides(es, laser)) {
            enemeyShipHitHandler(es, laser);
          }
        });
      });
    }
    sleep(playerLaserIterations * playerLaserInterval).then(() => {
      if (laser.parentElement) {
        hitsInARow = 0;
        laser.remove();
      }
    });
  }

  function enemeyShipHitHandler(es, laser) {
    laser.remove();
    es.remove();
    destroyedEnemies++;
    hitsInARow++;
    currentPoints =
      currentPoints +
      (Math.floor(hitsInARow / 10) + 1) * Number(es.attributes.points.value);
    document.getElementById("winLoss").classList.add("pointsFlash");
    sleep(750)
      .then(() =>
        document.getElementById("winLoss").classList.remove("pointsFlash")
      );
    document.getElementById("points").textContent = currentPoints;
    if (hitsInARow % 10 === 0) {
      upgradeTextControl("The Enemy Retreats!");
      moveEnemyShips("ver", -1);
    }
    if (destroyedEnemies === numberOfEnemies) {
      gameOverHandler("You Win!");
      setCookie("playerWinsSpace", playerWinsOnLoad + 1, 10);
      document.getElementById("playerWins").textContent = playerWinsOnLoad + 1;
      document.getElementById("myCanvas").style.display = "block";
    }
  }

  function fireComputerLaser(shouldReFire) {
    if (!gameOver) {
      const laser = document.createElement("div");
      const ess = enemyShips();
      laser.classList.add("enemyLaser");
      const cell =
        ess[randomIntFromInterval(0, ess.length - 1)].attributes
          .currentCell.value;
      document.getElementById("cell-" + cell).appendChild(laser);
      moveComputerLaser(laser, shouldReFire);
    }
  }

  function moveComputerLaser(laser, shouldReFire) {
    let shouldReturn = false;
    document.querySelectorAll(".blocker").forEach((blocker) => {
      if (colides(blocker, laser)) {
        laser.remove();
        blocker.classList.remove("blocker");
        if (shouldReFire) {
          fireComputerLaser(true);
        }
        shouldReturn = true;
      }
    });
    if (shouldReturn) {
      return;
    }

    if (colides(ship, laser)) {
      ship.remove();
      laser.remove();
      lossHandler();
    } else if (laser.offsetTop >= ship.offsetTop) {
      laser.remove();
      if (shouldReFire && !gameOver) {
        sleep(randomIntFromInterval(350, 550)).then(() => {
          fireComputerLaser(shouldReFire);
        });
      }
    } else {
      sleep(200).then(() => {
        laser.style.marginTop = convertToPXs(
          Number(
            laser.style.marginTop.substring(0, laser.style.marginTop.length - 2)
          ) + tickMovement
        );
        moveComputerLaser(laser, shouldReFire);
      });
    }
  }

  function startGame() {
    if (!gameStarted) {
      document.getElementById("start").classList.remove("startButtonFlash");
      document.getElementById("winLoss").scrollIntoView();
      modal("Start!", 1500);
      sleep(1500).then(() => {
        gameStarted = true;
        gameTick();
        fireComputerLaser(true);
      });
    }
  }

  function lossChecker() {
    if (
      enemyShips().some(
        (es) =>
          colides(es, ship) ||
          es.attributes.currentCell.value.split("-")[0] === "30"
      )
    ) {
      lossHandler();
    }
  }

  function lossHandler() {
    setCookie("playerLossesSpace", playerLossesOnLoad + 1, 10);
    document.getElementById("playerLosses").textContent =
      playerLossesOnLoad + 1;
    currentPoints = 0;
    setCookie("currentPointsSpace", 0, 10);
    document.getElementById("points").textContent = 0;
    playerLost = true;
    gameOverHandler("You Lose!");
  }

  function gameOverHandler(message) {
    gameOver = true;
    modal(message, 2000);
    Array.from(document.getElementsByClassName("laser")).forEach((l) =>
      l.remove()
    );
    Array.from(document.getElementsByClassName("enemyLaser")).forEach((l) =>
      l.remove()
    );
    setCookie("currentPointsSpace", currentPoints, 10);
    if (currentPoints > highScore && !playerLost) {
      setCookie("highScoreSpace", currentPoints, 10);
      document.getElementById("highScore").textContent = currentPoints;
    }
    document.getElementById("reload").textContent = "Play Again";
  }

  function upgradeTextControl(message) {
    const upgradeText = document.getElementById("upgradeText");
    upgradeText.textContent = message;
    sleep(4000).then(() => {
      upgradeText.textContent = "";
    });
  }

  function gameTick() {
    if (!gameOver) {
      if (enemiesInColumn("0") && !justMovedDown) {
        moveDownHelper(1);
      } else if (enemiesInColumn("46") && !justMovedDown) {
        moveDownHelper(-1);
      } else {
        moveEnemyShips("hor", horizontalDirection);
        justMovedDown = false;
      }
      if (randomIntFromInterval(1, 10) === 5) {
        fireComputerLaser(randomIntFromInterval(1, 15) === 5);
      }
      if (
        shotsFired % 10 === 0 &&
        destroyedEnemies / shotsFired > 0.65 &&
        !upgradedLaser
      ) {
        upgradeTextControl("Laser Upgraded!");
        cantFireInterval = 500;
        playerLaserInterval = 150;
        upgradedLaser = true;
      }
      lossChecker();
      if (!gameOver) {
        sleep(clockSpeed - 16 * shipSpeed).then(() => gameTick());
      }
    }
  }

  const enemiesInColumn = (col) =>
    enemyShips().some(
      (es) => es.attributes.currentCell.value.split("-")[1] === col
    );

  const moveDownHelper = (newHorizontalDirection) => {
    moveEnemyShips("ver", 1);
    justMovedDown = true;
    shipSpeed++;
    horizontalDirection = newHorizontalDirection;
  };

  function moveEnemyShips(direction, distance) {
    const blockers = document.querySelectorAll(".blocker");
    enemyShips().forEach((es) => {
      const row = Number(es.attributes.currentCell.value.split("-")[0]);
      const col = Number(es.attributes.currentCell.value.split("-")[1]);
      const ship = es.parentElement.removeChild(es);
      const newCell =
        direction === "hor"
          ? row + "-" + (col + distance)
          : row + distance + "-" + col;
      ship.attributes.currentCell.value = newCell;
      document.getElementById("cell-" + newCell).appendChild(ship);
      blockers.forEach((blocker) => {
        if (colides(blocker, es)) {
          blocker.classList.remove("blocker");
        }
      });
    });
  }

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie =
        cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
  }

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

  (() => {
    for (let i = 0; i < 32; i++) {
      const shipRow = document.createElement("div");
      document.getElementById("enemies").appendChild(shipRow);
      shipRow.classList.add("ship-row");
      shipRow.id = "row-" + i;
      for (let j = 0; j < 50; j++) {
        const shipCell = document.createElement("div");
        shipRow.appendChild(shipCell);
        shipCell.classList.add("ship-cell");
        shipCell.id = "cell-" + i + "-" + j;
        if (
          (i === 25 || i === 26) &&
          (j === 2 ||
            j === 3 ||
            j === 4 ||
            j === 5 ||
            j === 6 ||
            j === 12 ||
            j === 13 ||
            j === 14 ||
            j === 15 ||
            j === 16 ||
            j === 22 ||
            j === 23 ||
            j === 24 ||
            j === 25 ||
            j === 26 ||
            j === 32 ||
            j === 33 ||
            j === 34 ||
            j === 35 ||
            j === 36 ||
            j === 42 ||
            j === 43 ||
            j === 44 ||
            j === 45 ||
            j === 46)
        ) {
          if (
            i === 25 &&
            (j === 2 ||
              j === 6 ||
              j === 12 ||
              j === 16 ||
              j === 22 ||
              j === 26 ||
              j === 32 ||
              j === 36 ||
              j === 42 ||
              j === 46)
          ) {
            continue;
          }
          shipCell.classList.add("blocker");
        }
        if (
          i === 27 &&
          (j === 2 ||
            j === 6 ||
            j === 12 ||
            j === 16 ||
            j === 22 ||
            j === 26 ||
            j === 32 ||
            j === 36 ||
            j === 42 ||
            j === 46)
        ) {
          shipCell.classList.add("blocker");
        }
      }
    }

    for (let i = 1; i < 5; i++) {
      const shipImgToUse = imageStore[i - 1];
      for (let j = 1; j < 8; j++) {
        const enemyShip = document.createElement("div");
        const shipImg = document.createElement("img");
        shipImg.src = shipImgToUse;
        shipImg.classList.add("enemyShipImg");
        enemyShip.appendChild(shipImg);
        enemyShip.classList.add("enemyShip");
        document
          .getElementById("cell-" + 3 * i + "-" + 6 * j)
          .appendChild(enemyShip);
        enemyShip.setAttribute("currentCell", 3 * i + "-" + 6 * j);
        enemyShip.setAttribute("points", -10 * i + 60);
        numberOfEnemies++;
      }
    }

    document.addEventListener("keydown", shipControl);
    document.getElementById("start").addEventListener("click", startGame);
    document.getElementById("playerWins").textContent = playerWinsOnLoad;
    document.getElementById("playerLosses").textContent = playerLossesOnLoad;
    document.getElementById("highScore").textContent = highScore;
    document.getElementById("points").textContent = currentPoints;

    clockSpeed = clockSpeed - (currentPoints / 500) * 5;

    window.onkeydown = (e) =>
      !((e.key === " " || e.key === "ArrowUp") && e.target === document.body);
  })();
})();

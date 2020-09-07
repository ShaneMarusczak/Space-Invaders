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
	const playerWinsOnLoad = Number(window.getCookie("playerWinsSpace"));
	const playerLossesOnLoad = Number(window.getCookie("playerLossesSpace"));
	const clockSpeed = 375;
	const playerLaserInterval = 175;
	const playerLaserIterations = 28;
	const tickMovement = 25;
	const imageStore = ["images/enemy-4.png", "images/enemy-2.png", "images/enemy-3.png", "images/enemy-1.png"];
	const ship = document.getElementById("ship");
	const gameBoard = document.getElementById("gameBoard");

	const enemyShips = () => Array.from(document.getElementsByClassName("enemyShip"));

	const convertToPXs = (num) => num + "px";

	function shipControl(e) {
		if (gameStarted && !gameOver) {
			const posLeft = ship.offsetLeft - gameBoard.offsetLeft - 1;
			if (e.keyCode == "37" && posLeft - tickMovement >= 0) {
				e.preventDefault();
				ship.style.marginLeft = convertToPXs(posLeft - tickMovement);
			} else if (e.keyCode == "39" && posLeft + tickMovement <= (gameBoard.offsetWidth) - 100) {
				e.preventDefault();
				ship.style.marginLeft = convertToPXs(posLeft + tickMovement);
			} else if (e.keyCode == "32" && canFire) {
				e.preventDefault();
				shotsFired++;
				canFire = false;
				window.sleep(550).then(() => {
					canFire = true;
				});
				firePlayerLaser();
			}
		}
	}

	const colides = (obj1, obj2) => !(obj2.offsetLeft > obj1.offsetWidth + obj1.offsetLeft ||
		obj1.offsetLeft > obj2.offsetWidth + obj2.offsetLeft ||
		obj2.offsetTop > obj1.offsetHeight + obj1.offsetTop ||
		obj1.offsetTop > obj2.offsetHeight + obj2.offsetTop);


	function firePlayerLaser() {
		const laser = document.createElement("div");
		laser.classList.add("laser");
		laser.style.left = convertToPXs(ship.offsetLeft + 45);
		laser.style.top = convertToPXs(ship.offsetTop - 30);
		ship.appendChild(laser);
		for (let i = 0; i < playerLaserIterations; i++) {
			window.sleep(i * playerLaserInterval).then(() => {
				laser.style.top = convertToPXs(ship.offsetTop - tickMovement * 2 - (tickMovement * i));
				enemyShips().forEach(es => {
					if (colides(es, laser)) {
						laser.remove();
						es.remove();
						destroyedEnemies++;
						if (destroyedEnemies === numberOfEnemies) {
							gameOverHandler("You Win!");
							window.setCookie("playerWinsSpace", playerWinsOnLoad + 1, 10);
							document.getElementById("playerWins").innerText = "Wins: " + (playerWinsOnLoad + 1);
							document.getElementById("myCanvas").style.display = "block";

						}
					}
				});
			});
		}
		window.sleep(playerLaserIterations * playerLaserInterval).then(() => laser.remove());
	}

	function fireComputerLaser(shouldReFire) {
		if (!gameOver) {
			const laser = document.createElement("div");
			laser.classList.add("enemyLaser");
			const cell = enemyShips()[window.randomIntFromInterval(0, enemyShips().length - 1)].attributes.currentCell.value;
			document.getElementById("cell-" + cell).appendChild(laser);
			moveComputerLaser(laser, shouldReFire);
		}
	}

	function moveComputerLaser(laser, shouldReFire) {
		if (colides(ship, laser)) {
			ship.remove();
			laser.remove();
			gameOverHandler("You Lose!");
			window.setCookie("playerLossesSpace", playerLossesOnLoad + 1, 10);
			document.getElementById("playerLosses").innerText = "Losses: " + (playerLossesOnLoad + 1);
		} else if (laser.offsetTop >= ship.offsetTop) {
			laser.remove();
			if (shouldReFire && !gameOver) {
				window.sleep(window.randomIntFromInterval(350, 550)).then(() => {
					fireComputerLaser(shouldReFire);
				});
			}
		} else {
			window.sleep(200).then(() => {
				laser.style.marginTop = convertToPXs(Number(laser.style.marginTop.substring(0, laser.style.marginTop.length - 2)) + tickMovement);
				moveComputerLaser(laser, shouldReFire);
			});
		}
	}

	function startGame() {
		if (!gameStarted) {
			window.modal("Start!", 1500);
			window.sleep(1500).then(() => {
				gameStarted = true;
				gameTick();
				fireComputerLaser(true);
			});
		}
	}

	function lossChecker() {
		if (enemyShips().some(es => colides(es, ship) || es.attributes.currentCell.value.split("-")[0] === "30")) {
			gameOverHandler("You Lose!");
			window.setCookie("playerLossesSpace", playerLossesOnLoad + 1, 10);
			document.getElementById("playerLosses").innerText = "Losses: " + (playerLossesOnLoad + 1);
		}
	}

	function gameOverHandler(message) {
		gameOver = true;
		window.modal(message, 2000);
		Array.from(document.getElementsByClassName("laser")).forEach(l => l.remove());
		Array.from(document.getElementsByClassName("enemyLaser")).forEach(l => l.remove());
		if (shotsFired > 0) {
			document.getElementById("shotsFired").innerText = "Shots Fired: " + shotsFired;
			document.getElementById("accuracy").innerText = "Accuracy: " + Math.floor((destroyedEnemies / shotsFired) * 100) + "%";
		}
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
			if (window.randomIntFromInterval(1, 15) === 15) {
				fireComputerLaser(false);
			}
			lossChecker();
			if (!gameOver) {
				window.sleep(clockSpeed - (16 * shipSpeed)).then(() => gameTick());
			}
		}
	}

	const enemiesInColumn = (col) => enemyShips().some(es => es.attributes.currentCell.value.split("-")[1] === col);

	const moveDownHelper = (localHorizontalDirection) => {
		moveEnemyShips("ver", 1);
		justMovedDown = true;
		shipSpeed++;
		horizontalDirection = localHorizontalDirection;
	};

	function moveEnemyShips(direction, distance) {
		enemyShips().forEach(es => {
			const row = Number(es.attributes.currentCell.value.split("-")[0]);
			const col = Number(es.attributes.currentCell.value.split("-")[1]);
			const ship = es.parentElement.removeChild(es);
			const newCell = direction === "hor" ? row + "-" + (col + distance) : (row + distance) + "-" + col;
			ship.attributes.currentCell.value = newCell;
			document.getElementById("cell-" + newCell).appendChild(ship);
		});
	}

	(() => {

		const enemies = document.getElementById("enemies");

		for (let i = 0; i < 32; i++) {
			const shipRow = document.createElement("div");
			enemies.appendChild(shipRow);
			shipRow.classList.add("ship-row");
			shipRow.id = "row-" + i;
			for (let j = 0; j < 50; j++) {
				const shipCell = document.createElement("div");
				shipRow.appendChild(shipCell);
				shipCell.classList.add("ship-cell");
				shipCell.id = "cell-" + i + "-" + j;
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
				document.getElementById("cell-" + (3 * i) + "-" + (6 * j)).appendChild(enemyShip);
				enemyShip.setAttribute("currentCell", (3 * i) + "-" + (6 * j));
				numberOfEnemies++;
			}
		}

		document.addEventListener("keydown", shipControl);
		document.getElementById("start").addEventListener("click", startGame);
		document.getElementById("reload").addEventListener("click", () => location.reload());
		document.getElementById("playerWins").innerText = "Wins: " + playerWinsOnLoad;
		document.getElementById("playerLosses").innerText = "Losses: " + playerLossesOnLoad;

	})();
})();

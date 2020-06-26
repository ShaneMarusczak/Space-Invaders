"use strict";
(() => {
	let canFire = true;
	let gameStarted = false;
	let gameOver = false;
	let numberOfEnemies = 0;
	let destroyedEnemies = 0;
	let shotsFired = 0;
	let shipSpeed = 1;
	const height = 25;
	const ship = document.getElementById("ship");
	const gameBoard = document.getElementById("gameBoard");
	const enemyShips = () => Array.from(document.getElementsByClassName("enemyShip"));

	const convertToPXs = (num) => num + "px";

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function alertModalControl(message, duration) {
		document.getElementById("alertshader").style.display = "block";
		document.getElementById("alertmessage").innerText = message;
		sleep(duration).then(() => {
			document.getElementById("alertshader").style.display = "none";
		});
	}

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function shipControl(e) {
		if (gameStarted && !gameOver) {
			const posLeft = ship.offsetLeft - gameBoard.offsetLeft - 1;
			if (e.keyCode == "37" && posLeft - height >= 0) {
				e.preventDefault();
				ship.style.marginLeft = convertToPXs(posLeft - height);
			} else if (e.keyCode == "39" && posLeft + height <= (gameBoard.offsetWidth) - 100) {
				e.preventDefault();
				ship.style.marginLeft = convertToPXs(posLeft + height);
			} else if (e.keyCode == "32" && canFire) {
				e.preventDefault();
				shotsFired++;
				canFire = false;
				sleep(550).then(() => {
					canFire = true;
				});
				const laser = document.createElement("div");
				laser.classList.add("laser");
				laser.style.left = convertToPXs(ship.offsetLeft + 45);
				laser.style.top = convertToPXs(ship.offsetTop - 30);
				ship.appendChild(laser);
				firePlayerLaser(laser, ship);
			}
		}
	}

	function colides(obj1, obj2) {
		return !(obj2.offsetLeft > obj1.offsetWidth + obj1.offsetLeft ||
			obj1.offsetLeft > obj2.offsetWidth + obj2.offsetLeft ||
			obj2.offsetTop > obj1.offsetHeight + obj1.offsetTop ||
			obj1.offsetTop > obj2.offsetHeight + obj2.offsetTop);
	}

	function gameOverHandler(message) {
		gameOver = true;
		alertModalControl(message, 2000);
		Array.from(document.getElementsByClassName("laser")).forEach(l => l.remove());
		Array.from(document.getElementsByClassName("enemyLaser")).forEach(l => l.remove());
		document.getElementById("shotsFired").innerText = "Shots Fired: " + shotsFired;
		document.getElementById("accuracy").innerText = "Accuracy: " + Math.floor((destroyedEnemies / shotsFired) * 100) + "%";
	}

	function firePlayerLaser(laser, ship) {
		const interval = 175;
		const iterations = 28;
		for (let i = 0; i < iterations; i++) {
			sleep(i * interval).then(() => {
				laser.style.top = convertToPXs(ship.offsetTop - height * 2 - (height * i));
				enemyShips().forEach(es => {
					if (colides(es, laser)) {
						laser.remove();
						es.remove();
						destroyedEnemies++;
						if (destroyedEnemies === numberOfEnemies) {
							gameOverHandler("You Win!");
						}
					}
				});
			});
		}
		sleep(iterations * interval).then(() => laser.remove());
	}

	function fireComputerLaser(shouldReFire) {
		const laser = document.createElement("div");
		laser.classList.add("enemyLaser");
		const shipToFire = enemyShips()[randomIntFromInterval(0, enemyShips().length - 1)];
		document.getElementById("enemies").appendChild(laser);
		laser.style.left = convertToPXs(Number(shipToFire.style.left.substring(0, shipToFire.style.left.length - 2)) + Number(shipToFire.style.marginLeft.substring(0, shipToFire.style.marginLeft.length - 2)));
		laser.style.top = convertToPXs(Number(shipToFire.style.top.substring(0, shipToFire.style.top.length - 2)) + Number(shipToFire.style.marginTop.substring(0, shipToFire.style.marginTop.length - 2)));
		moveComputerLaser(laser, shouldReFire);
	}

	function moveComputerLaser(laser, shouldReFire) {
		if (colides(ship, laser)) {
			ship.remove();
			laser.remove();
			gameOverHandler("You Lose!");
		} else if (laser.offsetTop >= ship.offsetTop) {
			laser.remove();
			if (shouldReFire && !gameOver) {
				sleep(randomIntFromInterval(350, 550)).then(() => {
					fireComputerLaser(shouldReFire);
				});
			}
		} else {
			sleep(200).then(() => {
				laser.style.marginTop = convertToPXs(Number(laser.style.marginTop.substring(0, laser.style.marginTop.length - 2)) + height);
				moveComputerLaser(laser, shouldReFire);
			});
		}
	}

	function startGame() {
		if (!gameStarted) {
			alertModalControl("Start!", 1500);
			gameStarted = true;
			sleep(1500).then(() => {
				moveEnemyShipsRight();
				fireComputerLaser(true);
			});
		}
	}

	function moveEnemyShipsDown() {
		if (randomIntFromInterval(0, 4) === 4) {
			fireComputerLaser(false);
		}
		shipSpeed++;
		enemyShips().forEach(es => {
			es.style.marginTop = convertToPXs(Number(es.style.marginTop.substring(0, es.style.marginTop.length - 2)) + height);
		});
	}

	const gameBoardRightSide = gameBoard.offsetWidth + gameBoard.offsetLeft;

	function lossChecker() {
		if (enemyShips().some(es => es.offsetTop + 30 >= ship.offsetTop)) {
			gameOverHandler("You Lose!");
		}
	}

	function moveEnemyShipsRight() {
		if (!gameOver) {
			if (enemyShips().some(es => es.offsetLeft + height + 75 >= gameBoardRightSide)) {
				moveEnemyShipsDown();
				lossChecker();
				sleep(375 - 14 * shipSpeed).then(moveEnemyShipsLeft);
				return;
			}
			enemyShips().forEach(es => {
				es.style.marginLeft = convertToPXs(Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) + height);
			});
			sleep(375 - 14 * shipSpeed).then(moveEnemyShipsRight);
		}
	}

	function moveEnemyShipsLeft() {
		if (!gameOver) {
			if (enemyShips().some(es => es.offsetLeft - height <= gameBoard.offsetLeft)) {
				moveEnemyShipsDown();
				lossChecker();
				sleep(375 - 14 * shipSpeed).then(moveEnemyShipsRight);
				return;
			}
			enemyShips().forEach(es => {
				es.style.marginLeft = convertToPXs(Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) - height);
			});
			sleep(375 - 14 * shipSpeed).then(moveEnemyShipsLeft);
		}
	}
	const imageStore = ["images/enemy-4.png", "images/enemy-2.png", "images/enemy-3.png", "images/enemy-1.png"];

	(() => {
		for (let i = 1; i < 5; i++) {
			const shipImgToUse = imageStore[i - 1];
			for (let j = 1; j < 8; j++) {
				const enemyShip = document.createElement("div");
				const shipImg = document.createElement("img");
				shipImg.src = shipImgToUse;
				shipImg.classList.add("enemyShipImg");
				enemyShip.appendChild(shipImg);
				enemyShip.classList.add("enemyShip");
				enemyShip.style.top = convertToPXs(i * 60 + document.getElementById("gameBoard").offsetTop);
				enemyShip.style.left = convertToPXs(j * 120 + document.getElementById("gameBoard").offsetLeft);
				document.getElementById("enemies").appendChild(enemyShip);
				numberOfEnemies++;
			}
		}
		document.addEventListener("keydown", shipControl);
		document.getElementById("start").addEventListener("click", startGame);
		document.getElementById("reload").addEventListener("click", () => location.reload());
	})();
})();

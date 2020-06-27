"use strict";
(() => {
	let canFire = true;
	let gameStarted = false;
	let gameOver = false;
	let numberOfEnemies = 0;
	let destroyedEnemies = 0;
	let shotsFired = 0;
	let shipSpeed = 1;
	let movingRight = true;
	let justMovedDown = false;
	const playerWinsOnLoad = Number(getCookie("playerWinsSpace"));
	const playerLossesOnLoad = Number(getCookie("playerLossesSpace"));
	const clockSpeed = 375;
	const playerLaserInterval = 175;
	const playerLaserIterations = 28;
	const tickMovement = 25;
	const imageStore = ["images/enemy-4.png", "images/enemy-2.png", "images/enemy-3.png", "images/enemy-1.png"];
	const ship = document.getElementById("ship");
	const gameBoard = document.getElementById("gameBoard");
	const gameBoardRightSide = gameBoard.offsetWidth + gameBoard.offsetLeft;

	const enemyShips = () => Array.from(document.getElementsByClassName("enemyShip"));

	const convertToPXs = (num) => num + "px";

	const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	function alertModalControl(message, duration) {
		document.getElementById("alertshader").style.display = "block";
		document.getElementById("alertmessage").innerText = message;
		sleep(duration).then(() => {
			document.getElementById("alertshader").style.display = "none";
		});
	}

	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

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
				sleep(550).then(() => {
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
			sleep(i * playerLaserInterval).then(() => {
				laser.style.top = convertToPXs(ship.offsetTop - tickMovement * 2 - (tickMovement * i));
				enemyShips().forEach(es => {
					if (colides(es, laser)) {
						laser.remove();
						es.remove();
						destroyedEnemies++;
						if (destroyedEnemies === numberOfEnemies) {
							gameOverHandler("You Win!");
							setCookie("playerWinsSpace", playerWinsOnLoad + 1, 10);
							document.getElementById("playerWins").innerText = "Wins: " + (playerWinsOnLoad + 1);

						}
					}
				});
			});
		}
		sleep(playerLaserIterations * playerLaserInterval).then(() => laser.remove());
	}

	function fireComputerLaser(shouldReFire) {
		if (!gameOver) {
			const laser = document.createElement("div");
			laser.classList.add("enemyLaser");
			const shipToFire = enemyShips()[randomIntFromInterval(0, enemyShips().length - 1)];
			document.getElementById("enemies").appendChild(laser);
			laser.style.left = convertToPXs(33.5 + Number(shipToFire.style.left.substring(0, shipToFire.style.left.length - 2)) + Number(shipToFire.style.marginLeft.substring(0, shipToFire.style.marginLeft.length - 2)));
			laser.style.top = convertToPXs(40 + Number(shipToFire.style.top.substring(0, shipToFire.style.top.length - 2)) + Number(shipToFire.style.marginTop.substring(0, shipToFire.style.marginTop.length - 2)));
			moveComputerLaser(laser, shouldReFire);
		}
	}

	function moveComputerLaser(laser, shouldReFire) {
		if (colides(ship, laser)) {
			ship.remove();
			laser.remove();
			gameOverHandler("You Lose!");
			setCookie("playerLossesSpace", playerLossesOnLoad + 1, 10);
			document.getElementById("playerLosses").innerText = "Losses: " + (playerLossesOnLoad + 1);
		} else if (laser.offsetTop >= ship.offsetTop) {
			laser.remove();
			if (shouldReFire && !gameOver) {
				sleep(randomIntFromInterval(350, 550)).then(() => {
					fireComputerLaser(shouldReFire);
				});
			}
		} else {
			sleep(200).then(() => {
				laser.style.marginTop = convertToPXs(Number(laser.style.marginTop.substring(0, laser.style.marginTop.length - 2)) + tickMovement);
				moveComputerLaser(laser, shouldReFire);
			});
		}
	}

	function startGame() {
		if (!gameStarted) {
			alertModalControl("Start!", 1500);
			sleep(1500).then(() => {
				gameStarted = true;
				gameTick();
				fireComputerLaser(true);
			});
		}
	}

	function lossChecker() {
		if (enemyShips().some(es => es.offsetTop + 30 >= ship.offsetTop)) {
			gameOverHandler("You Lose!");
			setCookie("playerLossesSpace", playerLossesOnLoad + 1, 10);
			document.getElementById("playerLosses").innerText = "Losses: " + (playerLossesOnLoad + 1);
		}
	}

	function gameOverHandler(message) {
		gameOver = true;
		alertModalControl(message, 2000);
		Array.from(document.getElementsByClassName("laser")).forEach(l => l.remove());
		Array.from(document.getElementsByClassName("enemyLaser")).forEach(l => l.remove());
		if (shotsFired > 0) {
			document.getElementById("shotsFired").innerText = "Shots Fired: " + shotsFired;
			document.getElementById("accuracy").innerText = "Accuracy: " + Math.floor((destroyedEnemies / shotsFired) * 100) + "%";
		}
	}

	function gameTick() {
		if (!gameOver) {
			if (enemiesOnLeftEdge() && !justMovedDown) {
				moveEnemyShipsDown();
				movingRight = true;
			} else if (enemiesOnRightEdge() && !justMovedDown) {
				moveEnemyShipsDown();
				movingRight = false;
			} else {
				moveEnemyShips();
			}
			if (randomIntFromInterval(1, 15) === 15) {
				fireComputerLaser(false);
			}
			lossChecker();
			if (!gameOver) {
				sleep(clockSpeed - 14 * shipSpeed).then(() => gameTick());
			}
		}
	}

	const enemiesOnRightEdge = () => enemyShips().some(es => es.offsetLeft + tickMovement + 75 >= gameBoardRightSide);

	const enemiesOnLeftEdge = () => enemyShips().some(es => es.offsetLeft - tickMovement <= gameBoard.offsetLeft);

	function moveEnemyShipsDown() {
		shipSpeed++;
		enemyShips().forEach(es => {
			es.style.marginTop = convertToPXs(Number(es.style.marginTop.substring(0, es.style.marginTop.length - 2)) + tickMovement);
		});
		justMovedDown = true;
	}

	function moveEnemyShips() {
		if (movingRight) {
			enemyShips().forEach(es => {
				es.style.marginLeft = convertToPXs(Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) + tickMovement);
			});
		} else {
			enemyShips().forEach(es => {
				es.style.marginLeft = convertToPXs(Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) - tickMovement);
			});
		}
		justMovedDown = false;
	}

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
		document.getElementById("playerWins").innerText = "Wins: " + playerWinsOnLoad;
		document.getElementById("playerLosses").innerText = "Losses: " + playerLossesOnLoad;

	})();
})();

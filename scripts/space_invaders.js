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
			const posLeft = ship.offsetLeft - document.getElementById("gameBoard").offsetLeft - 1;
			if (e.keyCode == "37" && posLeft - height >= 0) {
				ship.style.marginLeft = (posLeft - height) + "px";
				e.preventDefault();
			} else if (e.keyCode == "39" && posLeft + height <= (document.getElementById("gameBoard").offsetWidth) - 100) {
				ship.style.marginLeft = (posLeft + height) + "px";
				e.preventDefault();
			} else if (e.keyCode == "32" && canFire) {
				shotsFired++;
				canFire = false;
				sleep(500).then(() => {
					canFire = true;
				});
				const laser = document.createElement("div");
				laser.classList.add("laser");
				laser.style.left = ship.offsetLeft + 45 + "px";
				laser.style.top = ship.offsetTop - 30 + "px";
				ship.appendChild(laser);
				fireLaser(laser, ship);
				e.preventDefault();
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
		document.getElementById("shotsFired").innerText = "Shots Fired: " + shotsFired;
		document.getElementById("accuracy").innerText = "Accuracy: " + Math.floor((destroyedEnemies / shotsFired) * 100) + "%";
	}

	function fireLaser(laser, ship) {
		const interval = 175;
		const iterations = 28;
		for (let i = 0; i < iterations; i++) {
			sleep(i * interval).then(() => {
				laser.style.top = ship.offsetTop - height * 2 - (height * i) + "px";
				Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
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

	function startGame() {
		if (!gameStarted) {
			alertModalControl("Start!", 1500);
			gameStarted = true;
			sleep(1500).then(moveEnemyShipsRight);
		}
	}

	function moveEnemyShipsDown() {
		shipSpeed++;
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginTop = (Number(es.style.marginTop.substring(0, es.style.marginTop.length - 2)) + height) + "px";
		});
	}

	const test = document.getElementById("gameBoard").offsetWidth + document.getElementById("gameBoard").offsetLeft;

	function lossChecker() {
		if (Array.from(document.getElementsByClassName("enemyShip")).some(es => es.offsetTop + 30 >= ship.offsetTop)) {
			gameOverHandler("You Lose!");
		}
	}

	function moveEnemyShipsRight() {
		if (gameOver) return;
		if (Array.from(document.getElementsByClassName("enemyShip")).some(es => es.offsetLeft + height + 75 >= test)) {
			moveEnemyShipsDown();
			lossChecker();
			sleep(375 - 15 * shipSpeed).then(moveEnemyShipsLeft);
			return;
		}
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginLeft = (Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) + height) + "px";
		});
		sleep(375 - 15 * shipSpeed).then(moveEnemyShipsRight);
	}

	function moveEnemyShipsLeft() {
		if (gameOver) return;
		if (Array.from(document.getElementsByClassName("enemyShip")).some(es => es.offsetLeft - height <= document.getElementById("gameBoard").offsetLeft)) {
			moveEnemyShipsDown();
			lossChecker();
			sleep(375 - 15 * shipSpeed).then(moveEnemyShipsRight);
			return;
		}
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginLeft = (Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) - height) + "px";
		});
		sleep(375 - 15 * shipSpeed).then(moveEnemyShipsLeft);
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
				enemyShip.style.top = i * 60 + document.getElementById("gameBoard").offsetTop + "px";
				enemyShip.style.left = j * 120 + document.getElementById("gameBoard").offsetLeft + "px";
				document.getElementById("enemies").appendChild(enemyShip);
				numberOfEnemies++;
			}
		}
		document.addEventListener("keydown", shipControl);
		document.getElementById("start").addEventListener("click", startGame);
		document.getElementById("reload").addEventListener("click", () => location.reload());
	})();
})();

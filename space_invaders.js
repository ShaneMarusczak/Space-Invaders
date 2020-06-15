"use strict";
(() => {
	let canFire = true;
	let gameStarted = false;
	let gameOver = false;
	let numberOfEnemies = 0;
	let destroyedEnemies = 0;
	const height = 25;

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
			const ship = document.getElementById("ship");
			const posLeft = ship.offsetLeft - document.getElementById("gameBoard").offsetLeft - 1;
			if (e.keyCode == "37" && posLeft - height >= 0) {
				ship.style.marginLeft = (posLeft - height) + "px";
				e.preventDefault();
			} else if (e.keyCode == "39" && posLeft + height <= (document.getElementById("gameBoard").offsetWidth) - 100) {
				ship.style.marginLeft = (posLeft + height) + "px";
				e.preventDefault();
			} else if (e.keyCode == "32" && canFire) {
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

	function colides(x1, y1, w1, h1, x2, y2, w2, h2) {
		return !(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2);
	}

	function gameOverHandler() {
		gameOver = true;
		alertModalControl("Game Over!", 2000);
		Array.from(document.getElementsByClassName("laser")).forEach(l => l.remove());
	}

	function fireLaser(laser, ship) {
		const interval = 200;
		const iterations = 28;
		for (let i = 0; i < iterations; i++) {
			sleep(i * interval).then(() => {
				laser.style.top = ship.offsetTop - height * 2 - (height * i) + "px";
				Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
					if (colides(es.offsetLeft, es.offsetTop, es.offsetWidth, es.offsetHeight,
						laser.offsetLeft, laser.offsetTop, laser.offsetWidth, laser.offsetHeight)) {
						laser.remove();
						es.remove();
						destroyedEnemies++;
						if (destroyedEnemies === numberOfEnemies) {
							gameOverHandler();
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
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginTop = (Number(es.style.marginTop.substring(0, es.style.marginTop.length - 2)) + height) + "px";
		});
	}

	const test = document.getElementById("gameBoard").offsetWidth + document.getElementById("gameBoard").offsetLeft;

	function moveEnemyShipsRight() {
		if (gameOver) return;
		if (Array.from(document.getElementsByClassName("enemyShip")).some(es => es.offsetLeft + height + 75 >= test)) {
			moveEnemyShipsDown();
			sleep(350).then(moveEnemyShipsLeft);
			return;
		}
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginLeft = (Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) + height) + "px";
		});
		sleep(350).then(moveEnemyShipsRight);
	}

	function moveEnemyShipsLeft() {
		if (gameOver) return;
		if (Array.from(document.getElementsByClassName("enemyShip")).some(es => es.offsetLeft - height <= document.getElementById("gameBoard").offsetLeft)) {
			moveEnemyShipsDown();
			sleep(350).then(moveEnemyShipsRight);
			return;
		}
		Array.from(document.getElementsByClassName("enemyShip")).forEach(es => {
			es.style.marginLeft = (Number(es.style.marginLeft.substring(0, es.style.marginLeft.length - 2)) - height) + "px";
		});
		sleep(350).then(moveEnemyShipsLeft);
	}


	(() => {
		for (let i = 1; i < 5; i++) {
			for (let j = 1; j < 8; j++) {
				const enemyShip = document.createElement("div");
				enemyShip.classList.add("enemyShip");
				enemyShip.style.top = i * 60 + document.getElementById("gameBoard").offsetTop + "px";
				enemyShip.style.left = j * 120 + document.getElementById("gameBoard").offsetLeft + "px";
				document.getElementById("enemies").appendChild(enemyShip);
				numberOfEnemies++;
			}
		}
		document.addEventListener("keydown", shipControl);
		document.getElementById("start").addEventListener("click", startGame);

	})();

})();

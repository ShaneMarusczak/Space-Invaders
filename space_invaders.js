"use strict";
(() => {
	let gameStarted = true;
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
			} else if (e.keyCode == "32") {
				const laser = document.createElement("div");
				laser.classList.add("laser");
				laser.style.left = ship.offsetLeft + 50 + "px";
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


	(() => {
		for (let i = 1; i < 5; i++) {
			for (let j = 1; j < 8; j++) {
				const enemyShip = document.createElement("div");
				enemyShip.classList.add("enemyShip");
				enemyShip.style.top = i * 50 + "px";
				enemyShip.style.left = (j * window.innerWidth * 0.065) + document.getElementById("gameBoard").offsetLeft + "px";
				document.getElementById("enemies").appendChild(enemyShip);
				numberOfEnemies++;
			}
		}
		document.addEventListener("keydown", shipControl);
	})();

})();

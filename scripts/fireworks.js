"use strict";
const maxFireworks = 5,
	maxSparks = 50;
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const fireworks = [];

for (let i = 0; i < maxFireworks; i++) {
	const firework = {
		"sparks": []
	};
	for (let n = 0; n < maxSparks; n++) {
		const spark = {
			"blue": Math.floor(Math.random() * 2),
			"green": Math.floor(Math.random() * 2),
			"red": Math.floor(Math.random() * 2),
			"vx": Math.random() * 5 + 0.5,
			"vy": Math.random() * 5 + 0.5,
			"weight": Math.random() * 0.3 + 0.03
		};
		if (Math.random() > 0.5) spark.vx = -spark.vx;
		if (Math.random() > 0.5) spark.vy = -spark.vy;
		firework.sparks.push(spark);
	}
	fireworks.push(firework);
	resetFirework(firework);
}
window.requestAnimationFrame(explode);

function resetFirework(firework) {
	firework.x = Math.floor(Math.random() * canvas.width);
	firework.y = canvas.height;
	firework.age = 0;
	firework.phase = "fly";
}

function explode() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	fireworks.forEach((firework, index) => {
		if (firework.phase == "explode") {
			firework.sparks.forEach((spark) => {
				for (let i = 0; i < 10; i++) {
					const trailAge = firework.age + i;
					const x = firework.x + spark.vx * trailAge;
					const y = firework.y + spark.vy * trailAge + spark.weight * trailAge * spark.weight * trailAge;
					const fade = i * 20 - firework.age * 2;
					const r = Math.floor(spark.red * fade);
					const g = Math.floor(spark.green * fade);
					const b = Math.floor(spark.blue * fade);
					context.beginPath();
					context.fillStyle = "rgba(" + r + "," + g + "," + b + ",1)";
					context.rect(x, y, 4, 4);
					context.fill();
				}
			});
			firework.age++;
			if (firework.age > 100 && Math.random() < 0.05) {
				resetFirework(firework);
			}
		} else {
			firework.y = firework.y - 10;
			for (let spark = 0; spark < 15; spark++) {
				context.beginPath();
				context.fillStyle = "rgba(" + index * 50 + "," + spark * 17 + ",0,1)";
				context.rect(firework.x + Math.random() * spark - spark / 2, firework.y + spark * 4, 4, 4);
				context.fill();
			}
			if (Math.random() < 0.001 || firework.y < 200) firework.phase = "explode";
		}
	});
	window.requestAnimationFrame(explode);
}

var camera, ui, dungeon; // Globals

window.onload = function() {
	try {
		camera = {};
		dungeon = new Dungeon();
		dungeon.generate();
		var pl = new Actor(dungeon.start[0], dungeon.start[1]);
		dungeon.actors.push(pl);
		ui = new UI(pl);

		if (CONFIG.debug) $("#debug").style.display = "block";

		var frameTime = performance.now();
		function tick(time) {
			var dt = time - frameTime;
			frameTime = time;
			ui.fps = 0.1 * (1000 / dt) + 0.9 * ui.fps;

			var t0, t1, t2;
			if (CONFIG.debug) t0 = performance.now();
			dungeon.update();
			if (CONFIG.debug) t1 = performance.now();
			camera.x = pl.pos[0];
			camera.y = pl.pos[1];
			ui.render(camera, dungeon);
			if (CONFIG.debug) t2 = performance.now();
			ui.update();
			if (CONFIG.debug) {
				t3 = performance.now();
				$("#time-update").innerHTML = (t1-t0).toFixed(2);
				$("#time-render").innerHTML = (t2-t1).toFixed(2);
				$("#time-ui").innerHTML = (t3-t2).toFixed(2);
			}
			requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);

	} catch(e) {
		$("#error").style.display = "block";
		$("#error").innerHTML = "ERROR: " + e.message + "\n" + e.stack;
		console.error(e);
	}
};

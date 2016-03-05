var CONFIG = {
	tileSize: 16,
	tileGap: 0,
	tileMag: 2,
	debug: false,
	moveDelay: 150,
	// Not really correct/reliable, but detecting touch screen is currently impossible
	touch: (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
};

var TILES = {
	empty: {
		tileCoords: [ 0, 15 ],
		walkable: false,
		transparent: false
	},
	floor: {
		tileCoords: [ 0, 1 ],
		walkable: true,
		transparent: true
	},
	wall: {
		tileCoords: [ 6, 1 ],
		walkable: false,
		transparent: false
	},
	door_wood: {
		tileCoords: [ 0, 6 ],
		walkable: true,
		transparent: false
	},
	door_wood_open: {
		tileCoords: [ 8, 2 ],
		walkable: true,
		transparent: true
	},
	door_metal: {
		tileCoords: [ 1, 6 ],
		walkable: true,
		transparent: false
	},
	door_metal_open: {
		tileCoords: [ 11, 2 ],
		walkable: true,
		transparent: true
	},
	stairs_down: {
		tileCoords: [ 1, 7 ],
		walkable: true,
		transparent: true
	},
	stairs_up: {
		tileCoords: [ 0, 7 ],
		walkable: true,
		transparent: true
	},

	pot: {
		tileCoords: [ 3, 3 ],
		walkable: true,
		transparent: true
	},
	chest: {
		tileCoords: [ 4, 4 ],
		walkable: true,
		transparent: true
	},
	chest_open: {
		tileCoords: [ 3, 4 ],
		walkable: true,
		transparent: true
	},
	switch: {
		tileCoords: [ 11, 5 ],
		walkable: true,
		transparent: true
	},
	switch_open: {
		tileCoords: [ 12, 5 ],
		walkable: true,
		transparent: true
	},

	well: {
		tileCoords: [ 7, 3 ],
		walkable: false,
		transparent: true
	},
	pillar: {
		tileCoords: [ 7, 4 ],
		walkable: false,
		transparent: true
	},
	statue: {
		tileCoords: [ 7, 5 ],
		walkable: false,
		transparent: true
	},
	cupboard: {
		tileCoords: [ 7, 6 ],
		walkable: false,
		transparent: true
	},
	table: {
		tileCoords: [ 6, 6 ],
		walkable: false,
		transparent: true
	},

	key: {
		tileCoords: [ 8, 8 ],
		walkable: true,
		transparent: true
	},
	gem: {
		tileCoords: [ 11, 9 ],
		walkable: true,
		transparent: true
	},

	player_male: {
		tileCoords: [ 24, 0 ],
		walkable: false,
		transparent: true
	},
	player_female: {
		tileCoords: [ 27, 0 ],
		walkable: false,
		transparent: true
	},

	skeleton: {
		tileCoords: [ 30, 0 ],
		walkable: false,
		transparent: true
	},
	skeleton: {
		tileCoords: [ 30, 0 ],
		walkable: false,
		transparent: true
	},
	slime: {
		tileCoords: [ 21, 4 ],
		walkable: false,
		transparent: true
	},
	bat: {
		tileCoords: [ 24, 4 ],
		walkable: false,
		transparent: true
	},
	ghost: {
		tileCoords: [ 27, 4 ],
		walkable: false,
		transparent: true
	},
	spider: {
		tileCoords: [ 30, 4 ],
		walkable: false,
		transparent: true
	},

	tileset: {},
	tilemap: {},
	tilearray: []
};

(function() {
	TILES.tileset = document.createElement("img");
	TILES.tileset.src = "assets/tileset.png";
	if (CONFIG.tileMag != 1)
		TILES.tileset.onload = function() {
			var resizeCanvas = document.createElement("canvas");
			resizeCanvas.width = Math.floor(this.width * CONFIG.tileMag);
			resizeCanvas.height = Math.floor(this.height * CONFIG.tileMag);
			resizeCanvas.style.width = resizeCanvas.width + "px";
			resizeCanvas.style.height = resizeCanvas.height + "px";
			var ctx = resizeCanvas.getContext("2d");
			if (ctx.imageSmoothingEnabled === undefined) {
				ctx.mozImageSmoothingEnabled = false;
				ctx.webkitImageSmoothingEnabled = false;
				ctx.msImageSmoothingEnabled = false;
			} else ctx.imageSmoothingEnabled = false;
			ctx.drawImage(this, 0, 0, resizeCanvas.width, resizeCanvas.height);
			TILES.tileset.onload = null;
			TILES.tileset.src = resizeCanvas.toDataURL("image/png");
		};
	var tileChs = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var count = 0;
	for (var i in TILES) {
		var tile = TILES[i];
		if (!tile.tileCoords) continue;
		if (count >= tileChs.length)
			throw new Error("Out of tile characters!");
		tile.name = i;
		tile.id = count;
		tile.ch = tileChs[count++];
		tile.tileCoords[0] *= (CONFIG.tileSize + CONFIG.tileGap) * CONFIG.tileMag;
		tile.tileCoords[1] *= (CONFIG.tileSize + CONFIG.tileGap) * CONFIG.tileMag;
		TILES.tilemap[tile.ch] = tile.tileCoords;
		TILES.tilearray[tile.id] = tile;
	}
})();


var MOBS = {
	skeleton: {
		name: "Skeleton", ch: TILES.skeleton.ch, ai: "hunter",
		health: 3, vision: 9
	},
	slime: {
		name: "Slime", ch: TILES.slime.ch, ai: "hunter",
		health: 2, vision: 5
	},
	bat: {
		name: "Giant Bat", ch: TILES.bat.ch, ai: "hunter",
		health: 1, vision: 4
	},
	ghost: {
		name: "Ghost", ch: TILES.ghost.ch, ai: "hunter",
		health: 2, vision: 9
	},
	spider: {
		name: "Giant Spider", ch: TILES.spider.ch, ai: "hunter",
		health: 2, vision: 7
	}
};

(function() {
	for (var i in MOBS)
		MOBS[i].id = i;
})();
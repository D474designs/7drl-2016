var CONFIG = {
	tileSize: 16,
	tileGap: 0,
	debug: false,
	roundDelay: 200,
	moveDuration: 140,
	// Not really correct/reliable, but detecting touch screen is currently impossible
	touch: (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
};

// User settings, saved to localStorage
var SETTINGS = {
	sounds: true,
	vibration: true,
	tileMag: 2
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
	coin: {
		tileCoords: [ 8, 9 ],
		walkable: true,
		transparent: true
	},
	gem: {
		tileCoords: [ 11, 9 ],
		walkable: true,
		transparent: true
	},
	ring: {
		tileCoords: [ 14, 9 ],
		walkable: true,
		transparent: true
	},
	potion_health: {
		name: "health potion",
		tileCoords: [ 14, 11 ],
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
	tilemap: {}
};

(function() {
	TILES.tileset = document.createElement("img");
	TILES.tileset.src = "assets/tileset.png";
	var tileChs = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var count = 0;
	for (var i in TILES) {
		var tile = TILES[i];
		if (!tile.tileCoords) continue;
		if (count >= tileChs.length)
			throw new Error("Out of tile characters!");
		tile.id = i;
		tile.name = tile.name || i;
		tile.ch = tileChs[count++];
		tile.tileCoords[0] *= (CONFIG.tileSize + CONFIG.tileGap);
		tile.tileCoords[1] *= (CONFIG.tileSize + CONFIG.tileGap);
		TILES.tilemap[tile.ch] = tile.tileCoords;
	}
})();


var MOBS = {
	skeleton: {
		name: "Skeleton", ch: TILES.skeleton.ch, ai: "hunter",
		health: 3, vision: 9, speed: 1
	},
	slime: {
		name: "Slime", ch: TILES.slime.ch, ai: "hunter",
		health: 2, vision: 5, speed: 0.5
	},
	bat: {
		name: "Giant Bat", ch: TILES.bat.ch, ai: "hunter",
		health: 1, vision: 4, speed: 1.5
	},
	ghost: {
		name: "Ghost", ch: TILES.ghost.ch, ai: "hunter",
		health: 2, vision: 9, speed: 1
	},
	spider: {
		name: "Giant Spider", ch: TILES.spider.ch, ai: "hunter",
		health: 2, vision: 7, speed: 1.2
	}
};

(function() {
	for (var i in MOBS)
		MOBS[i].id = i;
})();


var SOUNDS = {
	click: {
		src: "assets/sounds/click"
	},
	pickup: {
		src: "assets/sounds/pickup"
	},
	door_locked: {
		src: "assets/sounds/door_locked"
	},
	door_open: {
		src: "assets/sounds/door_open"
	},
	hit: {
		src: "assets/sounds/hit"
	},
	miss: {
		src: "assets/sounds/miss"
	}
};

(function() {
	var format = ".ogg";
	if (document.createElement("audio").canPlayType("audio/mp3"))
		format = ".mp3";
	for (var i in SOUNDS) {
		SOUNDS[i].id = i;
		SOUNDS[i].audio = new Audio(SOUNDS[i].src + format);
	}
})();

var CONFIG = {
	tileSize: 16,
	tileGap: 0,
	debug: false,
	roundDelay: 160,
	moveDuration: 140,
	animFrameDuration: 64,
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
		tileCoords: [ 0, 23 ], walkable: false, transparent: false
	},
	grass_plain: {
		tileCoords: [ 0, 0 ], walkable: true, transparent: true
	},
	grass_little: {
		tileCoords: [ 1, 0 ], walkable: true, transparent: true
	},
	grass_lots: {
		tileCoords: [ 2, 0 ], walkable: true, transparent: true
	},
	grass_dark: {
		tileCoords: [ 7, 0 ], walkable: true, transparent: true
	},
	grass_darker: {
		tileCoords: [ 6, 0 ], walkable: true, transparent: true
	},
	floor_wood: {
		tileCoords: [ 0, 1 ], walkable: true, transparent: true
	},
	floor_wood2: {
		tileCoords: [ 1, 1 ], walkable: true, transparent: true
	},
	floor_sand_a: {
		tileCoords: [ 0, 3 ], walkable: true, transparent: true
	},
	floor_sand_b: {
		tileCoords: [ 1, 3 ], walkable: true, transparent: true
	},
	floor_sand_c: {
		tileCoords: [ 2, 3 ], walkable: true, transparent: true
	},
	floor_sand_d: {
		tileCoords: [ 3, 3 ], walkable: true, transparent: true
	},
	floor_sand_rock1: {
		tileCoords: [ 4, 3 ], walkable: true, transparent: true
	},
	floor_sand_rock2: {
		tileCoords: [ 5, 3 ], walkable: true, transparent: true
	},
	floor_sand_rock3: {
		tileCoords: [ 6, 3 ], walkable: true, transparent: true
	},
	floor_sand_rock4: {
		tileCoords: [ 7, 3 ], walkable: true, transparent: true
	},
	floor_sand_alt: {
		tileCoords: [ 0, 2 ], walkable: true, transparent: true
	},
	floor_sand_dunes: {
		tileCoords: [ 1, 2 ], walkable: true, transparent: true
	},
	floor_tiles: {
		tileCoords: [ 3, 1 ], walkable: true, transparent: true
	},
	floor_cobblestone: {
		tileCoords: [ 0, 6 ], walkable: true, transparent: true
	},
	floor_cobblestone2: {
		tileCoords: [ 1, 6 ], walkable: true, transparent: true
	},
	wall_stone: {
		tileCoords: [ 2, 5 ], walkable: false, transparent: false
	},
	wall_stone2: {
		tileCoords: [ 7, 5 ], walkable: false, transparent: false
	},
	wall_stone_old: {
		tileCoords: [ 1, 4 ], walkable: false, transparent: false
	},
	wall_stone_old_small: {
		tileCoords: [ 0, 4 ], walkable: false, transparent: false
	},
	wall_bricks: {
		tileCoords: [ 1, 5 ], walkable: false, transparent: false
	},
	wall_mossy: {
		tileCoords: [ 0, 5 ], walkable: false, transparent: false
	},
	wall_rocks: {
		tileCoords: [ 3, 5 ], walkable: false, transparent: false
	},
	wall_rocks2: {
		tileCoords: [ 4, 5 ], walkable: false, transparent: false
	},
	wall_rocks3: {
		tileCoords: [ 5, 5 ], walkable: false, transparent: false
	},
	wall_logs: {
		tileCoords: [ 6, 5 ], walkable: false, transparent: false
	},
	wall_lava: {
		tileCoords: [ 4, 12 ], walkable: false, transparent: true
	},
	wall_lava2: {
		tileCoords: [ 5, 12 ], walkable: false, transparent: true
	},
	door_wood: {
		tileCoords: [ 8, 0 ], walkable: true, transparent: false
	},
	door_wood_open: {
		tileCoords: [ 8, 2 ], walkable: true, transparent: true
	},
	door_metal: {
		tileCoords: [ 9, 0 ], walkable: true, transparent: false
	},
	door_metal_open: {
		tileCoords: [ 9, 2 ], walkable: true, transparent: true
	},
	stairs_down: {
		tileCoords: [ 10, 1 ], walkable: true, transparent: true
	},
	stairs_up: {
		tileCoords: [ 10, 0 ], walkable: true, transparent: true
	},

	pot: {
		tileCoords: [ 12, 0 ], walkable: true, transparent: true
	},
	chest: {
		tileCoords: [ 11, 0 ], walkable: true, transparent: true
	},
	chest_open: {
		tileCoords: [ 11, 2 ], walkable: true, transparent: true
	},

	flowers: {
		tileCoords: [ 3, 0 ], walkable: true, transparent: true
	},
	bush: {
		tileCoords: [ 19, 0 ], walkable: true, transparent: true
	},
	tree: {
		tileCoords: [ 19, 1 ], walkable: false, transparent: true
	},
	tree2: {
		tileCoords: [ 19, 2 ], walkable: false, transparent: true
	},
	tree3: {
		tileCoords: [ 19, 3 ], walkable: false, transparent: true
	},
	rocks: {
		tileCoords: [ 19, 5 ], walkable: false, transparent: true
	},
	well: {
		tileCoords: [ 16, 0 ], walkable: false, transparent: true
	},
	pillar: {
		tileCoords: [ 16, 1 ], walkable: false, transparent: true
	},
	statue: {
		tileCoords: [ 16, 2 ], walkable: false, transparent: true
	},
	cupboard: {
		tileCoords: [ 16, 3 ], walkable: false, transparent: true
	},
	table: {
		tileCoords: [ 14, 1 ], walkable: false, transparent: true
	},

	altar: {
		tileCoords: [ 8, 7 ], walkable: true, transparent: true,
		anim: [ [ 8, 7 ], [ 9, 7 ], [ 10, 7 ] ], shop: true
	},
	key: {
		tileCoords: [ 8, 8 ], walkable: true, transparent: true
	},
	coin: {
		tileCoords: [ 8, 9 ], walkable: true, transparent: true
	},
	gem: {
		tileCoords: [ 11, 9 ], walkable: true, transparent: true
	},
	ring: {
		tileCoords: [ 14, 9 ], walkable: true, transparent: true
	},
	potion_health: {
		name: "health potion",
		tileCoords: [ 14, 11 ], walkable: true, transparent: true
	},

	player_male: {
		tileCoords: [ 24, 0 ], walkable: false, transparent: true,
		anim: [ [ 23, 0 ], [ 24, 0 ], [ 25, 0 ], [ 24, 0 ] ]
	},
	player_female: {
		tileCoords: [ 27, 0 ], walkable: false, transparent: true,
		anim: [ [ 26, 0 ], [ 27, 0 ], [ 28, 0 ], [ 27, 0 ] ]
	},

	skeleton: {
		tileCoords: [ 30, 0 ], walkable: false, transparent: true,
		anim: [ [ 29, 0 ], [ 30, 0 ], [ 31, 0 ], [ 30, 0 ] ]
	},
	slime: {
		tileCoords: [ 24, 2 ], walkable: false, transparent: true,
		anim: [ [ 23, 2 ], [ 24, 2 ], [ 25, 2 ], [ 24, 2 ] ]
	},
	bat: {
		tileCoords: [ 24, 1 ], walkable: false, transparent: true,
		anim: [ [ 23, 1 ], [ 24, 1 ], [ 25, 1 ], [ 24, 1 ] ]
	},
	ghost: {
		tileCoords: [ 27, 1 ], walkable: false, transparent: true,
		anim: [ [ 26, 1 ], [ 27, 1 ], [ 28, 1 ], [ 27, 1 ] ]
	},
	spider: {
		tileCoords: [ 30, 1 ], walkable: false, transparent: true,
		anim: [ [ 29, 1 ], [ 30, 1 ], [ 31, 1 ], [ 30, 1 ] ]
	},
	goblin: {
		tileCoords: [ 27, 2 ], walkable: false, transparent: true,
		anim: [ [ 26, 2 ], [ 27, 2 ], [ 28, 2 ], [ 27, 2 ] ]
	},

	tileset: null,
	tileArray: [],
	tilemap: {} // Obsolete
};

(function() {
	TILES.tileset = document.createElement("img");
	TILES.tileset.src = "assets/tileset.png";
	for (var i in TILES) {
		var tile = TILES[i];
		if (!tile.tileCoords) continue;
		tile.id = i;
		tile.name = tile.name || i;
		tile.ch = TILES.tileArray.length;
		tile.tileCoords[0] *= (CONFIG.tileSize + CONFIG.tileGap);
		tile.tileCoords[1] *= (CONFIG.tileSize + CONFIG.tileGap);
		if (tile.anim) {
			for (var a = 0; a < tile.anim.length; ++a) {
				tile.anim[a][0] *= (CONFIG.tileSize + CONFIG.tileGap);
				tile.anim[a][1] *= (CONFIG.tileSize + CONFIG.tileGap);
			}
		}
		TILES.tileArray.push(tile);
	}
})();


var MOBS = {
	skeleton: {
		name: "Skeleton", ch: TILES.skeleton.ch, ai: "hunter",
		health: 3, vision: 9, speed: 1,
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
	},
	goblin: {
		name: "Goblin", ch: TILES.goblin.ch, ai: "hunter",
		health: 5, vision: 9, speed: 1
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

var LEVELS = [
	{
		name: "Start Area",
		desc: "What a lovely forest clearing. But down leads your journey, monsters are waiting!",
		generator: "arena",
		width: 20,
		height: 15,
		altar: false,
		wallOnStaticLayer: true,
		wall: [ TILES.tree, TILES.tree2, TILES.tree3 ],
		floor: [ TILES.grass_plain, TILES.grass_plain, TILES.grass_plain, TILES.grass_little, TILES.grass_little, TILES.grass_lots ],
		decor: [ TILES.flowers, TILES.flowers, TILES.bush, TILES.bush, TILES.rocks, TILES.tree, TILES.tree2, TILES.tree3 ],
		decorAmount: 30,
		mobs: [],
		mobAmount: 0,
		items: [ TILES.coin ],
		itemAmount: 1
	},{
		name: "Log House",
		desc: "Curiously, you arrive at an underground log house.",
		generator: "dungeon",
		width: 40,
		height: 20,
		wall: [ TILES.wall_logs ],
		floor: [ TILES.floor_wood ],
		decor: [ TILES.table, TILES.cupboard, TILES.pot ],
		decorAmount: [ 15, 20 ],
		mobs: [ MOBS.spider, MOBS.bat, MOBS.bat, MOBS.bat ],
		mobAmount: [4, 5],
		items: [ TILES.potion_health, TILES.coin, TILES.coin ],
		itemAmount: [ 3, 4 ]
	},{
		name: "Small Maze",
		desc: "Argh, I hate mazes!",
		generator: "maze",
		width: [20, 25],
		height: [20, 25],
		wall: [ TILES.wall_stone2 ],
		floor: [ TILES.floor_tiles ],
		decor: [ ],
		decorAmount: 0,
		mobs: [ MOBS.ghost ],
		mobAmount: [4, 5],
		items: [ TILES.coin, TILES.gem ],
		itemAmount: [ 5, 6 ]
	},{
		name: "Sand cave",
		desc: "There is fine sand everywhere. No idea how they've formed dunes though, because there is no wind here.",
		generator: "cave",
		width: 40,
		height: 20,
		wall: [ TILES.wall_rocks3 ],
		floor: [ TILES.floor_sand_dunes ],
		decor: [ TILES.rocks ],
		decorAmount: [ 30, 35 ],
		mobs: [ MOBS.spider, MOBS.bat, MOBS.slime ],
		mobAmount: [5, 6],
		items: [ TILES.potion_health, TILES.coin, TILES.gem, TILES.gem ],
		itemAmount: [ 4, 6 ]
	},{
		name: "Prison",
		desc: "This looks like an old prison. Better be careful.",
		generator: "dungeon",
		width: 60,
		height: 40,
		roomWidth: [ 3, 5 ],
		roomHeight: [ 2, 5 ],
		dugPercentage: 0.5,
		wall: [ TILES.wall_stone_old ],
		floor: [ TILES.floor_tiles ],
		decor: [ TILES.pot ],
		decorAmount: [ 5, 8 ],
		mobs: [ MOBS.skeleton, MOBS.skeleton, MOBS.ghost ],
		mobAmount: [ 10, 12 ],
		items: [ TILES.potion_health, TILES.coin, TILES.coin, TILES.coin, TILES.coin ],
		itemAmount: [ 5, 6 ]
	},{
		name: "Underground Garden",
		desc: "It is wonderful how these plants can grow beneath the surface.",
		generator: "cave",
		width: 30,
		height: 30,
		wall: [ TILES.wall_rocks ],
		floor: [ TILES.grass_dark ],
		decor: [ TILES.well, TILES.statue, TILES.bush, TILES.bush, TILES.rocks, TILES.tree, TILES.tree2, TILES.tree3 ],
		decorAmount: 50,
		mobs: [ MOBS.spider, MOBS.spider, MOBS.goblin ],
		mobAmount: [1, 2],
		items: [ TILES.potion_health, TILES.potion_health, TILES.potion_health, TILES.gem ],
		itemAmount: [3, 4]
	},{
		name: "Sand Cave2",
		desc: "Sand again. Quite fine.",
		generator: "cave",
		width: 40,
		height: 20,
		wall: [ TILES.wall_rocks2 ],
		floor: [ TILES.floor_sand_a, TILES.floor_sand_b, TILES.floor_sand_c, TILES.floor_sand_d ],
		decor: [ TILES.floor_sand_rock1, TILES.floor_sand_rock2, TILES.floor_sand_rock3, TILES.floor_sand_rock4 ],
		decorAmount: [ 30, 35 ],
		mobs: [ MOBS.spider, MOBS.bat, MOBS.slime ],
		mobAmount: [5, 6],
		items: [ TILES.potion_health, TILES.coin, TILES.gem, TILES.gem ],
		itemAmount: [ 4, 6 ]
	},{
		name: "Lava Cave",
		desc: "It's hot in here.",
		generator: "cave",
		width: 40,
		height: 30,
		wall: [ TILES.wall_lava, TILES.wall_lava2 ],
		floor: [ TILES.floor_cobblestone, TILES.floor_cobblestone2 ],
		decor: [ TILES.rocks ],
		decorAmount: [ 30, 35 ],
		mobs: [ MOBS.goblin ],
		mobAmount: [5, 6],
		items: [ TILES.gem ],
		itemAmount: [ 4, 6 ]
	}
];

(function() {
	for (var i = 0; i < LEVELS.length; ++i)
		LEVELS[i].id = i;
})();
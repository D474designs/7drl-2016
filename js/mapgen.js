Dungeon.prototype.initMap = function(w, h) {
	this.width = w;
	this.height = h;
	this.map = new Array(Dungeon.LAYER_COUNT);
	for (var i = 0; i < Dungeon.LAYER_COUNT; ++i)
		this.map[i] = new Array(this.width * this.height);
}

Dungeon.prototype.generateItems = function(amount, choices, freeTiles) {
	for (var i = 0; i < amount; ++i) {
		var item = clone(choices.random());
		item.pos = freeTiles.pop();
		if (!item.pos) throw "Too little floor space for items!";
		this.setTile(item.pos[0], item.pos[1], item, Dungeon.LAYER_ITEM);
		this.items.push(item);
	}
};

Dungeon.prototype.generateMobs = function(amount, choices, freeTiles) {
	for (var i = 0; i < amount; ++i) {
		var pos = freeTiles.pop();
		if (!pos) throw "Too little floor space for mobs!";
		var mob = new Actor(pos[0], pos[1], choices.random());
		this.actors.push(mob);
	}
};

Dungeon.prototype.generateStairs = function(mapType) {
	var stairs_down = clone(TILES.stairs_down);
	stairs_down.entrance = { mapId: mapType + randInt(1000, 9999), mapType: mapType };
	this.setTile(this.end[0], this.end[1], stairs_down, Dungeon.LAYER_BG);
	//this.setTile(this.start[0]+1, this.start[1], stairs_down, Dungeon.LAYER_BG);
};

Dungeon.prototype.generateDungeon = function(params) {
	this.initMap(60, 24);
	var gen = new ROT.Map.Digger(this.width, this.height /*, {
		roomWidth: [5, 6],
		roomHeight: [4, 5],
		corridorLength: [2, 4],
		dugPercentage: 0.3,
		//roomDugPercentage: 0.5,
		timeLimit: 3000
	}*/);
	// General layout
	gen.create((function(x, y, wall) {
		this.setTile(x, y, wall ? TILES.wall_mossy : TILES.floor_wood);
	}).bind(this));
	var freeTiles = [];
	var rooms = gen.getRooms();
	var doors = [ TILES.door_wood, TILES.door_metal ];
	var keysNeeded = 0;
	var doorCallback = (function(x, y) {
		var door = doors.random();
		if (door.id == "door_metal")
			keysNeeded++;
		this.setTile(x, y, door, Dungeon.LAYER_STATIC);
	}).bind(this);
	this.start = rooms[0].getCenter();
	this.end = rooms[rooms.length-1].getCenter();
	for (var i = 0; i < rooms.length; i++) {
		rooms[i].getDoors(doorCallback);
		for (var y = rooms[i].getTop(); y < rooms[i].getBottom(); ++y) {
			for (var x = rooms[i].getLeft(); x < rooms[i].getRight(); ++x) {
				if ((x != this.start[0] || y != this.start[1]) &&
					(x != this.end[0] || y != this.end[1]))
						freeTiles.push([x, y]);
			}
		}
	}
	shuffle(freeTiles);

	// Decor / clutter
	var decorChoices = [ TILES.well, TILES.pillar, TILES.statue, TILES.table, TILES.cupboard, TILES.pot, TILES.chest ];
	for (var i = 0; i < 20; ++i) {
		var pos = freeTiles.pop();
		if (!pos) throw "Too little floor space for decor!";
		this.setTile(pos[0], pos[1], decorChoices.random(), Dungeon.LAYER_STATIC);
	}

	this.generateStairs("cave");

	// Items
	this.generateItems(keysNeeded, [TILES.key], freeTiles);
	this.generateItems(randInt(3,5), [TILES.coin], freeTiles);
	this.generateItems(randInt(2,3), [TILES.gem], freeTiles);
	//this.generateItems(randInt(1,2), [TILES.ring], freeTiles);
	this.generateItems(randInt(3,5), [TILES.potion_health], freeTiles);
	// Mobs
	this.mobProtos = [ MOBS.skeleton, MOBS.ghost ];
	this.generateMobs(randInt(7,10), this.mobProtos, freeTiles);

	this.needsRender = true;
};

Dungeon.prototype.generateCave = function(params) {
	// Seems there is a chance of large empty space at the bottom if height > width
	var w = randInt(40, 60);
	this.initMap(w, w - randInt(5, 15));

	var groundTile = TILES.floor_sand;
	var wallTile = TILES.wall_stone;
	this.mobProtos = [ MOBS.bat, MOBS.slime, MOBS.skeleton, MOBS.spider ];
	var freeTiles = [];
	// Basic borders
	var gen0 = new ROT.Map.Arena(this.width, this.height);
	gen0.create((function(x, y, wall) {
		if (wall) {
			this.setTile(x, y, wallTile);
		} else if ((x <= 1 || y <= 1 || x >= this.width-2 || y >= this.height-2) && Math.random() < 0.667) {
			this.setTile(x, y, wallTile);
		} else if ((x <= 2 || y <= 2 || x >= this.width-3 || y >= this.height-3) && Math.random() < 0.333) {
			this.setTile(x, y, wallTile);
		} else {
			this.setTile(x, y, groundTile);
		}
	}).bind(this));
	// Cellular middle part
	var offset = 4;
	var numGen = 1;
	var gen = new ROT.Map.Cellular(this.width - offset*2, this.height - offset*2, { connected: true });
	gen.randomize(0.5);
	for (var i = 0; i < numGen; ++i)
		gen.create(null);
	gen.create((function(x, y, wall) {
		x += offset; y += offset;
		if (wall) {
			this.setTile(x, y, wallTile);
		} else {
			this.setTile(x, y, groundTile);
			freeTiles.push([x, y]);
		}
	}).bind(this));
	shuffle(freeTiles);
	this.start = freeTiles.pop();
	this.end = freeTiles.pop();
	this.generateStairs("dungeon");
	// Items
	this.generateItems(randInt(5,7), [TILES.coin], freeTiles);
	this.generateItems(randInt(2,3), [TILES.gem], freeTiles);
	//this.generateItems(randInt(1,2), [TILES.ring], freeTiles);
	this.generateItems(randInt(0,2), [TILES.potion_health], freeTiles);
	// Mobs
	this.generateMobs(randInt(8,12), this.mobProtos, freeTiles);
	this.needsRender = true;
};
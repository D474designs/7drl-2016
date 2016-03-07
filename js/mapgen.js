Dungeon.prototype.parseRand = function(rangeOrNumber) {
	if (rangeOrNumber instanceof Array)
		return randInt(rangeOrNumber[0], rangeOrNumber[1])
	else if (typeof(rangeOrNumber) === "number")
		return rangeOrNumber;
	console.error("Invalid range or number", rangeOrNumber);
	return 0;
}

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

Dungeon.prototype.generateStairs = function(mapParams) {
	if (!mapParams)
		return;
	var stairs_down = clone(TILES.stairs_down);
	stairs_down.entrance = { mapId: "level-" + Dungeon.totalCount, mapParams: mapParams };
	this.setTile(this.end[0], this.end[1], stairs_down, Dungeon.LAYER_BG);
	//this.setTile(this.start[0]+1, this.start[1], stairs_down, Dungeon.LAYER_BG);
};

Dungeon.prototype.generateDungeon = function(params) {
	this.initMap(this.parseRand(params.width), this.parseRand(params.height));
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
		this.setTile(x, y, wall ? params.wall.random() : params.floor.random());
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
	this.generateItems(keysNeeded, [TILES.key], freeTiles);
	return freeTiles;
};

Dungeon.prototype.generateArena = function(params) {
	this.initMap(this.parseRand(params.width), this.parseRand(params.height));
	var freeTiles = [];
	// Basic borders
	var gen0 = new ROT.Map.Arena(this.width, this.height);
	gen0.create((function(x, y, wall) {
		if (wall) {
			this.setTile(x, y, params.wall.random());
		} else if ((x <= 1 || y <= 1 || x >= this.width-2 || y >= this.height-2) && Math.random() < 0.667) {
			this.setTile(x, y, params.wall.random());
		} else if ((x <= 2 || y <= 2 || x >= this.width-3 || y >= this.height-3) && Math.random() < 0.333) {
			this.setTile(x, y, params.wall.random());
		} else {
			this.setTile(x, y, params.floor.random());
			freeTiles.push([x, y]);
		}
	}).bind(this));
	shuffle(freeTiles);
	this.start = freeTiles.pop();
	this.end = freeTiles.pop();
	return freeTiles;
};

Dungeon.prototype.generateCave = function(params) {
	// Seems there is a chance of large empty space at the bottom if height > width
	var w = this.parseRand(params.width);
	var h = Math.min(this.parseRand(params.height), w - 1);
	this.initMap(w, h);
	var freeTiles = [];
	// Basic borders
	var gen0 = new ROT.Map.Arena(this.width, this.height);
	gen0.create((function(x, y, wall) {
		if (wall) {
			this.setTile(x, y, params.wall.random());
		} else if ((x <= 1 || y <= 1 || x >= this.width-2 || y >= this.height-2) && Math.random() < 0.667) {
			this.setTile(x, y, params.wall.random());
		} else if ((x <= 2 || y <= 2 || x >= this.width-3 || y >= this.height-3) && Math.random() < 0.333) {
			this.setTile(x, y, params.wall.random());
		} else {
			this.setTile(x, y, params.floor.random());
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
			this.setTile(x, y, params.wall.random());
		} else {
			this.setTile(x, y, params.floor.random());
			freeTiles.push([x, y]);
		}
	}).bind(this));
	shuffle(freeTiles);
	this.start = freeTiles.pop();
	this.end = freeTiles.pop();
	return freeTiles;
};

function Dungeon() {
	//ROT.RNG.setSeed(666);
	this.width = 60;
	this.height = 24;
	this.actors = [];
	this.items = [];
	this.playerFov = [];
	this.map = new Array(Dungeon.LAYER_COUNT);
	for (var i = 0; i < Dungeon.LAYER_COUNT; ++i)
		this.map[i] = new Array(this.width * this.height);
	this.start = [0, 0];
	this.end = [0, 0];
	this.needsRender = false;
}

Dungeon.LAYER_BG = 0;
Dungeon.LAYER_STATIC = 1;
Dungeon.LAYER_ITEM = 2;
Dungeon.LAYER_ACTOR = 3;
Dungeon.LAYER_COUNT = 4;

Dungeon.prototype.generate = function() {
	var gen = new ROT.Map.Digger(this.width, this.height);
	gen.create((function(x, y, wall) {
		this.setTile(x, y, wall ? TILES.wall : TILES.floor);
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

	var decorChoices = [ TILES.well, TILES.pillar, TILES.statue, TILES.table, TILES.cupboard, TILES.pot, TILES.chest ];
	for (var i = 0; i < 20; ++i) {
		var pos = freeTiles.pop();
		this.setTile(pos[0], pos[1], decorChoices.random(), Dungeon.LAYER_STATIC);
	}

	var stairs_down = clone(TILES.stairs_down);
	stairs_down.entrance = { mapId: "dungeon-" + randInt(1000, 9999), mapType: "dungeon" };
	this.setTile(this.end[0], this.end[1], stairs_down, Dungeon.LAYER_BG);

	// Items
	var sprinkleItems = (function(item, n) {
		for (var i = 0; i < n; ++i) {
			var item = clone(item);
			item.pos = freeTiles.pop();
			this.setTile(item.pos[0], item.pos[1], item, Dungeon.LAYER_ITEM);
			this.items.push(item);
		}
	}).bind(this);
	sprinkleItems(TILES.key, keysNeeded);
	sprinkleItems(TILES.coin, 10);
	sprinkleItems(TILES.gem, 5);
	sprinkleItems(TILES.ring, 2);
	sprinkleItems(TILES.potion_health, 6);

	// Mobs
	for (var i = 0; i < 10; ++i) {
		var pos = freeTiles.pop();
		var mob = new Actor(pos[0], pos[1], randProp(MOBS));
		this.actors.push(mob);
	}

	this.needsRender = true;
};

Dungeon.prototype.removeItem = function(item) {
	removeElem(this.items, item);
	this.setTile(item.pos[0], item.pos[1], null, Dungeon.LAYER_ITEM);
};

Dungeon.prototype.getTile = function(x, y, layer) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) return TILES.empty;
	if (layer !== undefined)
		return this.map[layer][x + y * this.width];
	for (layer = Dungeon.LAYER_COUNT - 1; layer >= 0; layer--)
		if (this.map[layer][x + y * this.width])
			return this.map[layer][x + y * this.width];
};

Dungeon.prototype.setTile = function(x, y, tile, layer) {
	if (!layer) layer = Dungeon.LAYER_BG;
	this.map[layer][x + y * this.width] = typeof tile == "string" ? TILES[tile] : tile;
	this.needsRender = true;
};

Dungeon.prototype.getPassable = function(x, y) {
	var static = this.getTile(x, y, Dungeon.LAYER_STATIC);
	if (static && !static.walkable) return false;
	return this.getTile(x, y, Dungeon.LAYER_BG).walkable;
};

Dungeon.prototype.getTransparent = function(x, y) {
	var static = this.getTile(x, y, Dungeon.LAYER_STATIC);
	if (static && !static.transparent) return false;
	return this.getTile(x, y, Dungeon.LAYER_BG).transparent;
};

Dungeon.prototype.findPath = function(x, y, actor) {
	var finder = new ROT.Path.AStar(x, y, this.getPassable.bind(this));
	var success = false;
	actor.path = [];
	finder.compute(actor.pos[0], actor.pos[1], function(x, y) {
		if (x != actor.pos[0] || y != actor.pos[1])
			actor.path.push([x, y]);
		success = true;
	});
	return success;
};

Dungeon.prototype.update = function() {
	for (var i = 0, l = this.map[Dungeon.LAYER_ACTOR].length; i < l; ++i)
		this.map[Dungeon.LAYER_ACTOR][i] = null;
	for (var i = 0, l = this.actors.length; i < l; ++i) {
		var actor = this.actors[i];
		this.map[Dungeon.LAYER_ACTOR][actor.pos[0] + actor.pos[1] * this.width] = actor;
	}
	this.needsRender = true;
};

Dungeon.prototype.draw = function(camera, display, player) {
	if (!this.needsRender)
		return;
	this.needsRender = false;
	display.clear();
	var w = display.getOptions().width;
	var h = display.getOptions().height;
	for (var j = 0; j < h; ++j) {
		for (var i = 0; i < w; ++i) {
			var x = i + camera.pos[0];
			var y = j + camera.pos[1];
			var k = x + y * this.width;
			var visibility = player.visibility(x, y);
			var tile = visibility > 0 ? [ this.map[Dungeon.LAYER_BG][k].ch ] : null;
			if (visibility > 0.5 && this.map[Dungeon.LAYER_STATIC][k])
				tile.push(this.map[Dungeon.LAYER_STATIC][k].ch);
			if (visibility > 0.9 && this.map[Dungeon.LAYER_ITEM][k])
				tile.push(this.map[Dungeon.LAYER_ITEM][k].ch);
			if (visibility > 0.9 && this.map[Dungeon.LAYER_ACTOR][k])
				tile.push(this.map[Dungeon.LAYER_ACTOR][k].ch);
			var color = visibility > 0.9 ? "transparent" : "rgba(0,0,0,0.6)";
			display.draw(i, j, tile, color, "rgba(0,0,0,0.0)");

		}
	}
};

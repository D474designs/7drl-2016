
function Dungeon() {
	//ROT.RNG.setSeed(666);
	this.width = 60;
	this.height = 24;
	this.actors = [];
	this.items = [];
	this.map = new Array(Dungeon.LAYER_COUNT);
	for (var i = 0; i < Dungeon.LAYER_COUNT; ++i)
		this.map[i] = new Array(this.width * this.height);
	this.start = [0, 0];
	this.needsRender = false;
	this.generate();
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
	var rooms = gen.getRooms();
	var doors = [ TILES.door_wood, TILES.door_metal ];
	var doorCallback = (function(x, y) {
		var door = doors.random();
		this.setTile(x, y, door, Dungeon.LAYER_STATIC);
	}).bind(this);
	for (var i = 0; i < rooms.length; i++) {
		rooms[i].getDoors(doorCallback);
	}
	this.start = rooms[0].getCenter();
	this.end = rooms[rooms.length-1].getCenter();


	this.setTile(this.end[0], this.end[1], TILES.stairs_down, Dungeon.LAYER_STATIC);

	this.needsRender = true;
};

Dungeon.prototype.getTile = function(x, y, layer) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) return TILES.empty;
	if (!layer) layer = Dungeon.LAYER_BG;
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
	return this.getTile(x, y).walkable;
};

Dungeon.prototype.getTransparent = function(x, y) {
	var static = this.getTile(x, y, Dungeon.LAYER_STATIC);
	if (static && !static.transparent) return false;
	return this.getTile(x, y).transparent;
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
	for (var i = 0, l = this.actors.length; i < l; ++i) {
		var actor = this.actors[i];
		if (actor.act()) {
			this.updateVisibility(actor);
			this.needsRender = true;
		}
	}
};

Dungeon.prototype.updateVisibility = function(actor) {
	if (actor.fov.length != this.map[0].length)
		actor.fov = new Array(this.width * this.height);
	for (var i = 0, l = actor.fov.length; i < l; ++i)
		if (actor.fov[i] == 1) actor.fov[i] = 0.5;
		else if (actor.fov[i] === undefined) actor.fov[i] = 0;
	function callback(x, y, r, visibility) {
		if (visibility > 0)
			actor.fov[x + y * this.width] = 1;
	}
	var fov = new ROT.FOV.PreciseShadowcasting((function(x, y) {
		return (x == actor.pos[0] && y == actor.pos[1]) ? true : this.getTransparent(x, y);
	}).bind(this));
	fov.compute(actor.pos[0], actor.pos[1], actor.vision, callback.bind(this));
};

Dungeon.prototype.draw = function(camera, display, player) {
	if (!this.needsRender)
		return;
	this.needsRender = false;
	display.clear();
	for (var i = 0, l = this.map[Dungeon.LAYER_ACTOR].length; i < l; ++i)
		this.map[Dungeon.LAYER_ACTOR][i] = null;
	for (var i = 0, l = this.actors.length; i < l; ++i) {
		var actor = this.actors[i];
		this.map[Dungeon.LAYER_ACTOR][actor.pos[0] + actor.pos[1] * this.width] = actor;
	}
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

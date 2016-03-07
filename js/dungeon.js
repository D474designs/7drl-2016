
function Dungeon(id, params) {
	//ROT.RNG.setSeed(666);
	this.id = id;
	this.width = 0;
	this.height = 0;
	this.actors = [];
	this.items = [];
	this.playerFov = [];
	this.map = [];
	this.start = [0, 0];
	this.end = [0, 0];
	var generators = {
		arena: this.generateArena.bind(this),
		dungeon: this.generateDungeon.bind(this),
		cave: this.generateCave.bind(this)
	};
	Dungeon.totalCount++;
	var freeTiles = generators[params.generator](params);
	// Items
	this.generateItems(randInt(3,5), [TILES.coin], freeTiles);
	this.generateItems(randInt(2,3), [TILES.gem], freeTiles);
	//this.generateItems(randInt(1,2), [TILES.ring], freeTiles);
	this.generateItems(randInt(3,5), [TILES.potion_health], freeTiles);
	// Mobs
	this.generateMobs(this.parseRand(params.mobAmount), params.mobs, freeTiles);
	// Decor / clutter
	var decorAmount = this.parseRand(params.decorAmount);
	for (var i = 0; i < decorAmount; ++i) {
		var pos = freeTiles.pop();
		if (!pos) {
			console.warn("Too little floor space for decor!");
			break;
		}
		this.setTile(pos[0], pos[1], params.decor.random(), Dungeon.LAYER_STATIC);
	}
	this.generateStairs(LEVELS[Dungeon.totalCount]);
	this.needsRender = true;
}

Dungeon.LAYER_BG = 0;
Dungeon.LAYER_STATIC = 1;
Dungeon.LAYER_ITEM = 2;
Dungeon.LAYER_ACTOR = 3;
Dungeon.LAYER_COUNT = 4;
Dungeon.totalCount = 0;

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

Dungeon.prototype.animate = function(dt) {
	for (var i = 0, l = this.actors.length; i < l; ++i) {
		var actor = this.actors[i];
		var dx = actor.pos[0] - actor.animPos[0];
		var dy = actor.pos[1] - actor.animPos[1];
		if (dx != 0 || dy != 0) {
			var speed = (1000 / CONFIG.moveDuration) * dt;
			var length = dist(0, 0, dx, dy);
			if (Math.abs(dx) <= speed)
				actor.animPos[0] = actor.pos[0];
			else
				actor.animPos[0] += dx / length * speed;
			if (Math.abs(dy) <= speed)
				actor.animPos[1] = actor.pos[1];
			else
				actor.animPos[1] += dy / length * speed;
			/*if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
				actor.animPos[0] = actor.pos[0];
				actor.animPos[1] = actor.pos[1];
			} else {
				actor.animPos[0] += dx * 0.1;
				actor.animPos[1] += dy * 0.1;
			}*/
			this.needsRender = true;
		}
	}
};

Dungeon.prototype.draw = function(camera, display, player) {
	if (!this.needsRender)
		return;
	this.needsRender = false;
	//display.clear();
	display._dirty = false;
	display._context.fillStyle = display._options.bg;
	display._context.fillRect(0, 0, display._context.canvas.width, display._context.canvas.height);

	var w = display.getOptions().width;
	var h = display.getOptions().height;
	var tw = display.getOptions().tileWidth;
	var th = display.getOptions().tileHeight;

	function drawTile(x, y, ch) {
		var tileCoords = TILES.tilemap[ch];
		display._context.drawImage(
			display._options.tileSet,
			tileCoords[0], tileCoords[1], tw, th,
			x, y, tw, th
		);
	}

	for (var j = 0; j < h; ++j) {
		for (var i = 0; i < w; ++i) {
			var x = i + camera.pos[0];
			var y = j + camera.pos[1];
			var k = x + y * this.width;
			if (x < 0 || y < 0 || x >= this.width || y >= this.height)
				continue;
			var visibility = player.visibility(x, y);
			if (visibility <= 0)
				continue;
			var visx = Math.round((i + camera.offset[0]) * tw);
			var visy = Math.round((j + camera.offset[1]) * th);
			drawTile(visx, visy, this.map[Dungeon.LAYER_BG][k].ch);
			if (visibility > 0.5 && this.map[Dungeon.LAYER_STATIC][k])
				drawTile(visx, visy, this.map[Dungeon.LAYER_STATIC][k].ch);
			if (visibility > 0.9 && this.map[Dungeon.LAYER_ITEM][k])
				drawTile(visx, visy, this.map[Dungeon.LAYER_ITEM][k].ch);
			if (visibility <= 0.9) {
				display._context.fillStyle = "rgba(0,0,0,0.6)";
				display._context.fillRect(visx, visy, tw, th);
			}
		}
	}
	for (var i = 0, l = this.actors.length; i < l; ++i) {
		var actor = this.actors[i];
		var visibility = player.visibility(actor.pos[0], actor.pos[1]);
		if (visibility > 0.9) {
			var tileCoords = TILES.tilemap[actor.ch];
			var x = actor.animPos[0] - camera.pos[0] + camera.offset[0];
			var y = actor.animPos[1] - camera.pos[1] + camera.offset[1];
			display._context.drawImage(
				display._options.tileSet,
				tileCoords[0], tileCoords[1], tw, th,
				x * tw, y * th, tw, th
			);
		}
	}
};

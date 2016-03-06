
function Actor(x, y, def) {
	def = def || {};
	this.id = def.id || null;
	this.name = def.name || "Player";
	this.pos = [ x || 0, y || 0 ];
	this.animPos = [ this.pos[0], this.pos[1] ];
	this.ch = def.ch || TILES.player_female.ch;
	this.path = [];
	this.fov = [];
	this.vision = def.vision || 8;
	this.health = def.health || 3;
	this.maxHealth = this.health;
	this.inv = {
		gems: 0,
		keys: 0
	};
	this.ai = !def.ai ? null : {
		type: def.ai,
		target: null
	};
	this.faction = def.ai ? 0 : 1;
	this.stats = {
		turns: 0,
		kills: 0
	};
	this.updateVisibility();
}

Actor.prototype.visibility = function(x, y) {
	return this.fov[x + y * world.dungeon.width];
};

Actor.prototype.updateVisibility = function(actor) {
	if (this.fov.length != world.dungeon.map[0].length)
		this.fov = new Array(world.dungeon.width * world.dungeon.height);
	for (var i = 0, l = this.fov.length; i < l; ++i)
		if (this.fov[i] == 1) this.fov[i] = 0.5;
		else if (this.fov[i] === undefined) this.fov[i] = 0;
	function callback(x, y, r, visibility) {
		if (visibility > 0)
			this.fov[x + y * world.dungeon.width] = 1;
	}
	var fov = new ROT.FOV.PreciseShadowcasting(world.dungeon.getTransparent.bind(world.dungeon));
	fov.compute(this.pos[0], this.pos[1], this.vision, callback.bind(this));
};

Actor.prototype.moveTo = function(x, y) {
	//var target = world.dungeon.getTile(x, y);
	//if (!target.walkable) return;
	if (x == this.pos[0] && y == this.pos[1]) {
		this.done = true; // Skip turn
		return true;
	}
	if (!world.dungeon.getPassable(x, y)) return false;
	return world.dungeon.findPath(x, y, this);
};

Actor.prototype.move = function(dx, dy) {
	this.moveTo(this.pos[0] + dx, this.pos[1] + dy);
};

Actor.prototype.doPath = function(checkItems, checkMapChange) {
	if (this.path.length) {
		// Pathing
		var waypoint = this.path.shift();
		// Check enemy
		var enemy = world.dungeon.getTile(waypoint[0], waypoint[1], Dungeon.LAYER_ACTOR);
		if (enemy) {
			this.path = [];
			if (this.faction != enemy.faction) {
				this.attack(enemy);
				return true;
			}
			return false;
		}
		// Check items
		var item = world.dungeon.getTile(waypoint[0], waypoint[1], Dungeon.LAYER_ITEM);
		if (checkItems && item && this.path.length == 0) {
			this.animPos = lerpVec2(this.pos, waypoint, 0.2);
			if (item.id == "gem") {
				this.inv.gems++;
				triggerAnimation($(".gem"), "tada");
			} else if (item.id == "key") {
				this.inv.keys++;
				triggerAnimation($(".key"), "tada")
			} else if (item.id == "potion_health") {
				if (this.health >= this.maxHealth) {
					ui.msg("Health already full.", this);
					return true;
				}
				this.health++;
				triggerAnimation($(".heart"), "tada");
			}
			world.dungeon.removeItem(item);
			ui.msg("Picked up a " + item.name + ".", this);
			ui.snd("pickup", this);
			return true;
		}
		var object = world.dungeon.getTile(waypoint[0], waypoint[1], Dungeon.LAYER_STATIC);
		if (object) {
			if (object.id == "door_wood") {
				world.dungeon.setTile(waypoint[0], waypoint[1], "door_wood_open", Dungeon.LAYER_STATIC);
				ui.snd("door_open", this);
			} else if (object.id == "door_metal") {
				this.animPos = lerpVec2(this.pos, waypoint, 0.2);
				if (this.inv.keys > 0) {
					this.inv.keys--;
					world.dungeon.setTile(waypoint[0], waypoint[1], "door_metal_open", Dungeon.LAYER_STATIC);
					ui.snd("door_open", this);
				} else {
					ui.msg("The door is locked! Find a key.", this);
					ui.snd("door_locked", this);
				}
				this.path = [];
				return true;
			}
		}
		this.pos[0] = waypoint[0];
		this.pos[1] = waypoint[1];
		this.moveTimer = Date.now() + CONFIG.moveDelay;
		// Check for map change
		if (checkMapChange) {
			var tile = world.dungeon.getTile(this.pos[0], this.pos[1]);
			if (tile.entrance && this.path.length === 0) {
				world.changeMap(this, tile.entrance);
			}
		}
		return true;
	}
	return false;
};

Actor.prototype.attack = function(target) {
	this.animPos = lerpVec2(this.pos, target.pos, 0.3);
	var hit = randInt(0, 1); // TODO
	if (hit) {
		var damage = 1; // TODO
		target.health -= damage;
		ui.snd("hit", this);
		ui.snd("hit", target);
		if (target.health <= 0) {
			target.health = 0;
			this.stats.kills++;
			ui.msg("You killed " + target.name + "!", this);
			ui.msg(this.name + " kills you!", target, "warn");
			ui.vibrate(300, target);
		} else {
			ui.msg("You hit " + target.name + " for " + damage + "!", this);
			ui.msg(this.name + " hits you for " + damage + "!", target, "warn");
			ui.vibrate(75, target);
		}
	} else {
		ui.msg("You missed " + target.name + "!", this);
		ui.msg(this.name + " missed you!", target);
		ui.snd("miss", this);
		ui.snd("miss", target);
	}
};

Actor.prototype.act = function() {
	if (this.health <= 0)
		return true;

	if (this.ai)
		return this.hunterAI();

	if (this.doPath(true, true)) {
		this.updateVisibility();
		return true;
	}
	return false;
};

Actor.prototype.drunkAI = function() {
	var dx = randInt(-1, 1);
	var dy = randInt(-1, 1);
	var newPos = [ this.pos[0] + dx, this.pos[1] + dy ];
	if (world.dungeon.getPassable(newPos[0], newPos[1]));
		this.path.push(newPos);
	return true;
};

Actor.prototype.hunterAI = function() {
	if (!this.ai.target) {
		var newTarget = ui.actor; // TODO: Other possibilities?
		this.updateVisibility();
		if (this.visibility(newTarget.pos[0], newTarget.pos[1]) < 1)
			return this.drunkAI();
		this.ai.target = ui.actor;
	}
	var target = this.ai.target;
	var tx = target.pos[0], ty = target.pos[1];
	this.moveTo(target.pos[0], target.pos[1]);
	this.doPath(false, false);
	return true;
};
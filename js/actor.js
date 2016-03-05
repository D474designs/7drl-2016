
function Actor(x, y) {
	this.pos = [ x || 0, y || 0 ];
	this.ch = dungeon.actors.length % 2 ? TILES.player_male.ch : TILES.player_female.ch;
	this.path = [];
	this.fov = [];
	this.vision = 8;
	this.client = null;
	this.moveTimer = 0;
	this.health = 3;
	this.inv = {
		gems: 0,
		keys: 0
	};
}

Actor.prototype.visibility = function(x, y) {
	return this.fov[x + y * dungeon.width];
};

Actor.prototype.act = function() {
	if (this.path.length && Date.now() > this.moveTimer) {
		// Pathing
		var waypoint = this.path.shift();
		if (this.path.length == 0) {
			var item = dungeon.getTile(waypoint[0], waypoint[1], Dungeon.LAYER_ITEM);
			if (item && item.name == "gem") {
				this.inv.gems++;
				dungeon.removeItem(item);
				ui.msg("Picked up a gem.", this);
				triggerAnimation($(".gem"), "tada");
				return true;
			} else if (item && item.name == "key") {
				this.inv.keys++;
				dungeon.removeItem(item);
				ui.msg("Picked up a key.", this);
				triggerAnimation($(".key"), "tada")
				return true;
			}
		}
		var object = dungeon.getTile(waypoint[0], waypoint[1], Dungeon.LAYER_STATIC);
		if (object) {
			if (object.name == "door_wood") {
				dungeon.setTile(waypoint[0], waypoint[1], "door_wood_open", Dungeon.LAYER_STATIC);
			} else if (object.name == "door_metal") {
				if (this.inv.keys > 0) {
					this.inv.keys--;
					dungeon.setTile(waypoint[0], waypoint[1], "door_metal_open", Dungeon.LAYER_STATIC);
				} else {
					ui.msg("The door is locked! Find a key.");
				}
				this.path = [];
				return true;
			}
		}
		this.pos[0] = waypoint[0];
		this.pos[1] = waypoint[1];
		this.moveTimer = Date.now() + CONFIG.moveDelay;
		return true;
	}
	return false;
};

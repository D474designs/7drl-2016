
function Actor(x, y) {
	this.pos = [ x || 0, y || 0 ];
	this.ch = dungeon.actors.length % 2 ? TILES.player_male.ch : TILES.player_female.ch;
	this.path = [];
	this.fov = [];
	this.vision = 8;
	this.client = null;
	this.moveTimer = 0;
}

Actor.prototype.visibility = function(x, y) {
	return this.fov[x + y * dungeon.width];
};

Actor.prototype.act = function() {
	if (this.path.length && Date.now() > this.moveTimer) {
		// Pathing
		var waypoint = this.path.shift();
		this.pos[0] = waypoint[0];
		this.pos[1] = waypoint[1];
		this.moveTimer = Date.now() + CONFIG.moveDelay;
		return true;
	}
	return false;
};

var debugDisplay; // = new ROT.Display({width: 100, height: 100, fontSize: 6});
//document.body.appendChild(debugDisplay.getContainer());

function World() {
	"use strict";
	this.maps = {
		start: new Dungeon()
	};
	this.dungeon = this.maps.start;
	this.scheduler = new ROT.Scheduler.Speed();
	this.currentActor = null;
	this.roundTimer = 0;
	this.running = false;
	this.mapChanged = false;

	if (debugDisplay)
		for (var j = 0; j < this.dungeon.height; ++j)
			for (var i = 0; i < this.dungeon.width; ++i)
				if (!this.dungeon.map[i + j * this.dungeon.width].walkable)
					debugDisplay.draw(i, j, "#");
}

World.prototype.create = function() {
	this.dungeon.generate();
	var def = {
		ch: TILES[ui.characterChoice].ch,
		health: 10
	}
	var pl = new Actor(this.dungeon.start[0], this.dungeon.start[1], def);
	this.dungeon.actors.push(pl);
	this.scheduler.clear();
	for (var i = 0; i < this.dungeon.actors.length; ++i)
		this.scheduler.add(this.dungeon.actors[i], true);
	this.running = true;
	return pl;
}

World.prototype.update = function(dt) {
	if (!this.running)
		return;
	this.dungeon.animate(dt);
	if (Date.now() < this.roundTimer || !this.dungeon.actors.length)
		return;
	if (!this.currentActor)
		this.currentActor = this.scheduler.next();
	while (!this.mapChanged && this.currentActor.act()) {
		this.currentActor.stats.turns++;
		if (this.currentActor.health <= 0) {
			removeElem(this.dungeon.actors, this.currentActor);
			this.scheduler.remove(this.currentActor);
			if (this.currentActor == ui.actor) {
				this.running = false;
				ui.die();
				return;
			}
		}
		this.dungeon.update();
		this.currentActor = this.scheduler.next();
		if (this.currentActor == ui.actor) {
			this.roundTimer = Date.now() + CONFIG.roundDelay;
			this.currentActor.updateVisibility();
			break; // Always wait for next round after player action
		} else if (distSq(this.currentActor.pos[0], this.currentActor.pos[1], ui.actor.pos[0], ui.actor.pos[1]) < 6) {
			this.roundTimer = Date.now() + CONFIG.roundDelay;
			break;
		}
	}
	this.mapChanged = false;
};

World.prototype.changeMap = function(actor, entrance) {
	removeElem(this.dungeon.actors, actor);
	this.dungeon.start = clone(actor.pos);
	this.dungeon.playerFov = actor.fov;
	if (!this.maps[entrance.mapId]) {
		this.maps[entrance.mapId] = new Dungeon(entrance.mapId, entrance.mapType);
		this.maps[entrance.mapId].generate();
	}
	this.dungeon = this.maps[entrance.mapId];
	this.dungeon.actors.push(actor);
	actor.pos[0] = this.dungeon.start[0];
	actor.pos[1] = this.dungeon.start[1];
	actor.animPos[0] = actor.pos[0];
	actor.animPos[1] = actor.pos[1];
	actor.fov = this.dungeon.playerFov;
	actor.updateVisibility();
	//if (this.dungeon.mobProtos.length && this.dungeon.actors.length < 5) {
	//	this.dungeon.spawnMobs(randInt(4, 7));
	//}
	this.scheduler.clear();
	for (var i = 0; i < this.dungeon.actors.length; ++i)
		this.scheduler.add(this.dungeon.actors[i], true);
	this.mapChanged = true;
};

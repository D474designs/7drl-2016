var debugDisplay; // = new ROT.Display({width: 100, height: 100, fontSize: 6});
//document.body.appendChild(debugDisplay.getContainer());

function World() {
	"use strict";
	this.maps = {
		start: new Dungeon()
	};
	this.dungeon = this.maps.start;
	this.currentActorIndex = 0;
	this.roundTimer = 0;
	this.running = false;

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
	this.running = true;
	return pl;
}

World.prototype.update = function(dt) {
	if (!this.running)
		return;
	this.dungeon.animate(dt);
	if (Date.now() < this.roundTimer)
		return;
	while (this.dungeon.actors.length) {
		if (this.currentActorIndex >= this.dungeon.actors.length)
			this.currentActorIndex = 0;
		var actor = this.dungeon.actors[this.currentActorIndex];
		if (!actor.act()) break;
		actor.stats.turns++;
		if (actor.health <= 0) {
			this.dungeon.actors.splice(this.currentActorIndex, 1);
			if (actor == ui.actor) {
				this.running = false;
				ui.die();
				return;
			}
		} else this.currentActorIndex++;
		this.dungeon.update();
		if (actor == ui.actor) {
			actor.updateVisibility();
			break; // Always wait for next round after player action
		}
	}
	this.roundTimer = Date.now() + CONFIG.roundDelay;
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
	this.currentActor = null;
	//if (this.dungeon.mobProtos.length && this.dungeon.actors.length < 5) {
	//	this.dungeon.spawnMobs(randInt(4, 7));
	//}
};

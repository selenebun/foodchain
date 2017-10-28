function createEntity(x, y, template) {
    var e = new Entity(x, y);
    var keys = Object.keys(template);
    if (typeof template.nutrition !== 'undefined') {
        e.maxNut = template.nutrition;
    }
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        e[key] = template[key];
    }
    e.template = template;
    return e;
}


// Steering functions

function nearestTarget(entities, newEntities) {
    var sum = createVector(0, 0);
    // Pursuing target
    var toChase = getByType(entities, this.chase);
    if (toChase.length !== 0) {
        var t = this.getNearest(toChase);
        if (chaseLines) {
            if (dispMode === 1) {
                stroke(this.color[0], this.color[1], this.color[2], 191);
            } else if (dispMode === 2) {
                stroke(255, 255, 255);
            } else {
                stroke(this.color[0], this.color[1], this.color[2], 127);
            }
            line(t.pos.x, t.pos.y, this.pos.x, this.pos.y);
        }
        this.onChase(t, newEntities);
        sum.add(this.target(t, this.chasePriority));
    }
    // Avoidance
    var toAvoid = getByType(entities, this.flee);
    for (var i = 0; i < toAvoid.length; ++i) {
        var e = toAvoid[i];
        if (e === this) continue;
        if (fleeLines) {
            if (dispMode === 1) {
                stroke(0, 0, 255, 255);
            } else if (dispMode === 2) {
                stroke(255, 255, 255);
            } else {
                stroke(0, 0, 255, 127);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onFlee(e, newEntities);
        sum.add(this.target(e, this.fleePriority * -1));
    }
    return sum;
}

function multiTarget(entities) {
    var sum = createVector(0, 0);
    // Pursuing targets
    var toChase = getByType(entities, this.chase);
    for (var i = 0; i < toChase.length; ++i) {
        var e = toChase[i];
        if (e === this) continue;
        if (chaseLines) {
            if (dispMode === 1) {
                stroke(this.color[0], this.color[1], this.color[2], 191);
            } else if (dispMode === 2) {
                stroke(255, 255, 255);
            } else {
                stroke(this.color[0], this.color[1], this.color[2], 127);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onChase(e, newEntities);
        sum.add(this.target(e, this.chasePriority));
    }
    // Avoidance
    var toAvoid = getByType(entities, this.flee);
    for (var i = 0; i < toAvoid.length; ++i) {
        var e = toAvoid[i];
        if (e === this) continue;
        if (fleeLines) {
            if (dispMode === 1) {
                stroke(0, 0, 255, 255);
            } else if (dispMode === 2) {
                stroke(255, 255, 255);
            } else {
                stroke(0, 0, 255, 127);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onFlee(e, newEntities);
        sum.add(this.target(e, this.fleePriority * -1));
    }
    return sum;
}


// Templates

var foodTemplate = {
    accAmt: 0,
    color: [135, 211, 124],
    name: 'food',
    topSpeed: 0,
    hunger: function() {}
};

var preyTemplate = {
    accAmt: 0.5,
    chase: ['food'],
    chasePriority: 2,
    color: [82, 179, 217],
    name: 'prey',
    nutrition: 400,
    perception: 100,
    radius: 8,
    steer: nearestTarget,
    topSpeed: 3,
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            var x = this.pos.x + random(-20, 20);
            var y = this.pos.y + random(-20, 20);
            newEntities.push(createEntity(x, y, preyTemplate));
        }
    }
};

var predTemplate = {
    accAmt: 0.4,
    chase: ['prey'],
    chasePriority: 4,
    color: [207, 0, 15],
    flee: ['pred', 'turret', 'bullet', 'swarm'],
    fleePriority: 0.5,
    name: 'pred',
    nutrition: 200,
    perception: 150,
    radius: 12,
    steer: multiTarget,
    topSpeed: 4,
    onDeath: function(newEntities) {
        if (random(3) >= 2) return;
        var x = this.pos.x;
        var y = this.pos.y;
        newEntities.push(createEntity(x, y, foodTemplate));
    },
    onEatAttempt: function(e, newEntities) {
        this.vel.mult(0);
        if (random(5) >= 1) return;
        this.onEat(e, newEntities);
        e.onEaten(this, newEntities);
    },
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            if (random(5) >= 1 || e.name !== 'prey') return;
            var x = this.pos.x + random(-20, 20);
            var y = this.pos.y + random(-20, 20);
            newEntities.push(createEntity(x, y, predTemplate));
        }
    }
};

var hiveTemplate = {
    accAmt: 0,
    chase: ['pred', 'prey', 'fungus'],
    color: [54, 215, 183],
    name: 'hive',
    nutrition: 500,
    perception: 100,
    radius: 30,
    steer: nearestTarget,
    swarmRadius: 5,
    swarmPerception: 75,
    topSpeed: 0,
    onEatAttempt: function(e, newEntities) {},
    onChase: function(e, newEntities) {
        if (random(15) >= 1) return;
        var s = createEntity(this.pos.x, this.pos.y, swarmTemplate);
        s.hive = this;
        newEntities.push(s);
    }
};

var swarmTemplate = {
    accAmt: 0.4,
    chase: ['pred', 'prey', 'fungus'],
    chasePriority: 4,
    color: [249, 191, 59],
    flee: ['swarm'],
    name: 'swarm',
    nutrition: 150,
    perception: 75,
    steer: nearestTarget,
    topSpeed: 4,
    onChase: function(e, newEntities) {
        if (random(5) >= 1) return;
        var s = createEntity(this.pos.x, this.pos.y, swarmerTemplate);
        newEntities.push(s);
    },
    onDeath: function(newEntities) {
        if (random(3) >= 2) return;
        var x = this.pos.x;
        var y = this.pos.y;
        newEntities.push(createEntity(x, y, foodTemplate));
    },
    onEatAttempt: function(e, newEntities) {
        if (typeof this.hive !== 'undefined' && !this.hive.alive) {
            this.hive = undefined;
        }
        this.vel.mult(0);
        if (random(15) >= 1) return;
        if (typeof this.hive === 'undefined') {
            this.onEat(e, newEntities);
        } else {
            this.hive.onEat(e, newEntities);
        }
        e.onEaten(this, newEntities);
        if (random(23) >= 1) return;
        newEntities.push(createEntity(this.pos.x, this.pos.y, hiveTemplate));
        if (typeof this.hive !== 'undefined') return;
        newEntities.push(createEntity(this.pos.x, this.pos.y, swarmTemplate));
    }
};

var swarmerTemplate = {
    accAmt: 0.4,
    chase: ['pred', 'prey', 'fungus'],
    color: [249, 191, 59],
    name: 'swarmer',
    nutrition: 25,
    perception: 50,
    steer: nearestTarget,
    topSpeed: 4,
    onEatAttempt: function(e, newEntities) {
        this.vel.mult(0);
        if (random(15) >= 1) return;
        this.onEat(e, newEntities);
        e.onEaten(this, newEntities);
    }
};

var fungusTemplate = {
    accAmt: 0,
    chase: ['prey'],
    color: [102, 51, 153],
    name: 'fungus',
    nutrition: 500,
    perception: 10,
    radius: 10,
    topSpeed: 0,
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            if (random(2) < 1) {
                var x = this.pos.x + random(-20, 20);
                var y = this.pos.y + random(-20, 20);
                newEntities.push(createEntity(x, y, foodTemplate));
            }
            var x = this.pos.x + random(-100, 100);
            var y = this.pos.y + random(-100, 100);
            newEntities.push(createEntity(x, y, fungusTemplate));
        }
    }
};

/*
var snakeTemplate = {
    accAmt: 0,
    chase: ['prey', 'fungus', 'swarm'],
    color: [232, 126, 4],
    flee: ['pred'],
    name: 'snake',
    nutrition: 300,
    perception: 200,
    radius: 12,
    steer: nearestTarget,
    topSpeed: 2,
    onChase: function(e, newEntities) {
        this.accAmt = 0.3;
        this.topSpeed = 4;
    },
    onEat(e, newEntities) {
        this.eat(e);
        if (random(10) >= 1) return;
        newEntities.push(createEntity(this.pos.x, this.pos.y, snakeTemplate));
    },
    onFlee: function(e, newEntities) {
        this.accAmt = 0.3;
        this.topSpeed = 4;
    },
    onFrame: function(newEntities) {
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        var t = createEntity(x, y, tailTemplate);
        t.nutrition = this.nutrition > 50 ? 50 : this.nutrition;
        t.maxNut = t.nutrition;
        t.head = this;
        newEntities.push(t);
    },
    onWander: function(newEntities) {
        this.accAmt = 0;
        this.topSpeed = 2;
    }
};

var tailTemplate = {
    accAmt: 0,
    chase: ['prey', 'fungus', 'swarm'],
    color: [232, 126, 4],
    name: 'snakeTail',
    nutrition: 50,
    perception: 12,
    radius: 12,
    topSpeed: 0,
    onEatAttempt: function(e, newEntities) {
        if (typeof this.head === 'undefined') {
            this.onEat(e, newEntities);
        } else {
            this.head.onEat(e, newEntities);
        }
        e.onEaten(this, newEntities);
    }
};

var spawnerTemplate = {
    accAmt: 0,
    color: [174, 168, 211],
    name: 'spawner',
    radius: 30,
    topSpeed: 0,
    hunger: function() {},
    onEaten: function(e, newEntities) {
        var s = createEntity(this.pos.x, this.pos.y, spawnerTemplate);
        s.toSpawn = e.template;
        s.name = e.name + '-spawner';
        s.color = e.color;
        newEntities.push(s);
    },
    onFrame: function(newEntities) {
        if (random(40) >= 1 || typeof this.toSpawn === 'undefined') return;
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        newEntities.push(createEntity(x, y, this.toSpawn));
    }
};

var missileTemplate = {
    accAmt: 1,
    chase: ['fungus'],
    chasePriority: 2,
    flee: ['pred'],
    fleePriority: 1,
    color: [249, 191, 59],
    name: 'missile',
    nutrition: 300,
    perception: 200,
    steer: multiTarget,
    topSpeed: 5,
    onEat: function(e, newEntities) {
        this.eat(e);
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        newEntities.push(createEntity(x, y, missileTemplate));
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        newEntities.push(createEntity(x, y, missileTemplate));
    }
};
*/

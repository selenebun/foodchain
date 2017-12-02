function createEntity(x, y, template) {
    var e = new Entity(x, y);

    // Define max nutrition from nutrition if necessary
    if (
        typeof template.nutrition !== 'undefined' &&
        typeof template.maxNutrition === 'undefined'
    ) {
        e.maxNutrition = template.nutrition;
    }
    // Define nutrition from max nutrition if necessary
    if (
        typeof template.nutrition === 'undefined' &&
        typeof template.maxNutrition !== 'undefined'
    ) {
        e.nutrition = template.maxNutrition;
    }

    // Fill in all keys
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    e.template = template;
    return e;
}


// Steering functions

function nearestTarget(entities, newEntities) {
    var sum = createVector(0, 0);

    // Pursuing a single target
    var targets = getByName(entities, this.toChase);
    if (targets.length > 0) {
        var e = this.getNearest(targets);
        if (chaseLines) {
            if (lineMode) {
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
    targets = getByName(entities, this.toAvoid);
    for (var i = 0; i < targets.length; i++) {
        var e = toAvoid[i];
        if (e === this) continue;
        if (avoidLines) {
            if (lineMode) {
                stroke(255, 255, 255);
            } else {
                stroke(0, 0, 255);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onAvoid(e, newEntities);
        sum.add(this.target(e, this.avoidPriority * -1));
    }
    
    return sum;
}

function multiTarget(entities, newEntities) {
    var sum = createVector(0, 0);

    // Pursuing targets
    var targets = getByName(entities, this.toChase);
    for (var i = 0; i < targets.length; i++) {
        var e = targets[i];
        if (e === this) continue;
        if (chaseLines) {
            if (lineMode) {
                stroke(255, 255, 255);
            } else {
                stroke(this.color[0], this.color[1], this.color[2], 191);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onChase(e, newEntities);
        sum.add(this.target(e, this.chasePriority));
    }

    // Avoidance
    targets = getByName(entities, this.toAvoid);
    for (var i = 0; i < targets.length; i++) {
        var e = targets[i];
        if (e === this) continue;
        if (avoidLines) {
            if (lineMode) {
                stroke(255, 255, 255);
            } else {
                stroke(0, 0, 255);
            }
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        this.onAvoid(e, newEntities);
        sum.add(this.target(e, this.avoidPriority * -1));
    }

    return sum;
}


// Templates

var templates = {};

templates.food = {
    accAmt: 0,
    color: [135, 211, 124],
    name: 'food',
    topSpeed: 0,
    hunger: function() {}
};

templates.fungus = {
    accAmt: 0,
    color: [102, 51, 153],
    name: 'fungus',
    nutrition: 500,
    perception: 10,
    radius: 10,
    toChase: ['prey'],
    toEat: ['prey'],
    topSpeed: 0,
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            if (random(2) < 1) {
                var x = this.pos.x + random(-20, 20);
                var y = this.pos.y + random(-20, 20);
                newEntities.push(createEntity(x, y, templates.food));
            }
            var x = this.pos.x + random(-100, 100);
            var y = this.pos.y + random(-100, 100);
            newEntities.push(createEntity(x, y, templates.fungus));
        }
    }
}

templates.hive = {
    accAmt: 0,
    color: [54, 215, 183],
    name: 'hive',
    nutrition: 500,
    perception: 100,
    radius: 30,
    steer: nearestTarget,
    toChase: ['fungus', 'pred', 'prey'],
    topSpeed: 0,
    onChase: function(e, newEntities) {
        if (random(15) >= 1) return;
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        var s = createEntity(x, y, templates.swarm);
        s.hive = this;
        newEntities.push(s);
    }
};

templates.pred = {
    accAmt: 0.4,
    avoidPriority: 0.5,
    chasePriority: 4,
    color: [207, 0, 15],
    name: 'pred',
    nutrition: 200,
    perception: 150,
    radius: 12,
    steer: multiTarget,
    toAvoid: ['pred', 'swarm'],
    toChase: ['prey'],
    toEat: ['prey'],
    topSpeed: 4,
    onDeath: function(newEntities) {
        if (random(3) >= 2) return;
        var x = this.pos.x;
        var y = this.pos.y;
        newEntities.push(createEntity(x, y, templates.food));
    },
    onEatAttempt: function(e, newEntities) {
        this.vel.mult(0);
        if (random(5) >= 1) return;
        if (this.onEat(e, newEntities)) e.onEaten(this, newEntities);
    },
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            if (random(5) >= 1) return false;
            var x = this.pos.x + random(-20, 20);
            var y = this.pos.y + random(-20, 20);
            newEntities.push(createEntity(x, y, templates.pred));
        }
    }
};

templates.prey = {
    accAmt: 0.5,
    chasePriority: 2,
    color: [82, 179, 217],
    name: 'prey',
    nutrition: 400,
    perception: 100,
    radius: 8,
    steer: nearestTarget,
    toChase: ['food'],
    toEat: ['food'],
    topSpeed: 3,
    onEat: function(e, newEntities) {
        if (this.eat(e)) {
            var x = this.pos.x + random(-20, 20);
            var y = this.pos.y + random(-20, 20);
            newEntities.push(createEntity(x, y, templates.prey));
        }
    }
};

templates.swarm = {
    accAmt: 0.4,
    chasePriority: 4,
    color: [249, 191, 59],
    name: 'swarm',
    nutrition: 150,
    perception: 75,
    steer: nearestTarget,
    toAvoid: ['swarm'],
    toChase: ['fungus', 'pred', 'prey'],
    toEat: ['fungus', 'pred', 'prey'],
    topSpeed: 4,
    onChase: function(e, newEntities) {
        if (random(5) >= 1) return;
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        var s = createEntity(x, y, templates.swarmer);
        newEntities.push(s);
    },
    onDeath: function(newEntities) {
        if (random(3) >= 2) return;
        newEntities.push(createEntity(this.pos.x, this.pos.y, templates.food));
    },
    onEatAttempt: function(e, newEntities) {
        if (typeof this.hive !== 'undefined' && !this.hive.alive) {
            this.hive = undefined;
        }
        this.vel.mult(0);
        if (random(15) >= 1) return;
        var success;
        if (typeof this.hive === 'undefined') {
            success = this.onEat(e, newEntities);
        } else {
            success = this.hive.onEat(e, newEntities);
        }
        if (!success) return;
        e.onEaten(this, newEntities);
        if (random(23) >= 1) return;
        newEntities.push(createEntity(this.pos.x, this.pos.y, templates.hive));
        if (typeof this.hive !== 'undefined') return;
        newEntities.push(createEntity(
            this.pos.x, this.pos.y, templates.swarm
        ));
    }
};

templates.swarmer = {
    accAmt: 0.4,
    color: [249, 191, 59],
    name: 'swarmer',
    nutrition: 25,
    perception: 50,
    steer: nearestTarget,
    toChase: ['fungus', 'pred', 'prey'],
    toEat: ['fungus', 'pred', 'prey'],
    topSpeed: 4,
    onEatAttempt: function(e, newEntities) {
        this.vel.mult(0);
        if (random(15) >= 1) return;
        if (this.onEat(e, newEntities)) e.onEaten(this, newEntities);
    }
};

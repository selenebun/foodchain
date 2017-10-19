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
    return e;
}


// Steering functions

function nearestTarget(entities) {
    var sum = createVector(0, 0);
    // Pursuing target
    var toChase = getByType(entities, this.chase);
    if (toChase.length !== 0) {
        var t = this.getNearest(toChase);
        if (chaseLines) {
            stroke(this.color[0], this.color[1], this.color[2], 127);
            line(t.pos.x, t.pos.y, this.pos.x, this.pos.y);
        }
        sum.add(this.target(t, this.chasePriority));
    }
    // Avoidance
    var toAvoid = getByType(entities, this.flee);
    for (var i = 0; i < toAvoid.length; ++i) {
        var e = toAvoid[i];
        if (e === this) continue;
        if (fleeLines) {
            stroke(0, 0, 255, 127);
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
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
            stroke(this.color[0], this.color[1], this.color[2], 127);
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
        sum.add(this.target(e, this.chasePriority));
    }
    // Avoidance
    var toAvoid = getByType(entities, this.flee);
    for (var i = 0; i < toAvoid.length; ++i) {
        var e = toAvoid[i];
        if (e === this) continue;
        if (fleeLines) {
            stroke(0, 0, 255, 127);
            line(e.pos.x, e.pos.y, this.pos.x, this.pos.y);
        }
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
        this.eat(e);
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        newEntities.push(createEntity(x, y, preyTemplate));
    }
};

var predTemplate = {
    accAmt: 0.4,
    chase: ['prey', 'missile'],
    chasePriority: 4,
    color: [207, 0, 15],
    flee: ['pred'],
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
    onEat: function(e, newEntities) {
        this.vel.mult(0);
        if (random(5) >= 1) return;
        this.eat(e);
        if (random(5) >= 1) return;
        var x = this.pos.x + random(-20, 20);
        var y = this.pos.y + random(-20, 20);
        newEntities.push(createEntity(x, y, predTemplate));
    }
};

var fungusTemplate = {
    accAmt: 0,
    color: [102, 51, 153],
    name: 'fungus',
    nutrition: 500,
    radius: 10,
    topSpeed: 0
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

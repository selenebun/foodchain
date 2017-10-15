function createEntity(x, y, template) {
    var e = new Entity(x, y);
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        e[key] = template[key];
    }
    return e;
}


function steer(targets, avoid) {
    var sum = createVector(0, 0);
    // pursuing targets
    /*
    for (var i = 0; i < targets.length; ++i) {
        if (targets[i] === this) continue;
        sum.add(this.target(targets[i], 1));
    }
    */
    if (targets.length !== 0) {
        sum.add(this.target(this.getNearest(targets), this.chasePriority));
    }
    // avoiding
    for (var i = 0; i < avoid.length; ++i) {
        if (avoid[i] === this) continue;
        sum.add(this.target(avoid[i], this.fleePriority));
    }
    this.acc = sum.limit(this.accAmt);
}

function trackTarget(targets, avoid) {
    var sum = createVector(0, 0);
    // pursuing targets
    /*
    for (var i = 0; i < targets.length; ++i) {
        if (targets[i] === this) continue;
        sum.add(this.target(targets[i], 1));
    }
    */
    if (typeof this.following === 'undefined' || !this.following.alive) {
        this.following = random(prey);
    }
    if (prey.length !== 0) {
        sum.add(this.target(this.following, this.chasePriority));
    }
    // avoiding
    for (var i = 0; i < avoid.length; ++i) {
        if (avoid[i] === this) continue;
        sum.add(this.target(avoid[i], this.fleePriority));
    }
    this.acc = sum.limit(this.accAmt);
}


var foodTemplate = {
    color: [135, 211, 124],
    starve: false
};

var preyTemplate = {
    accAmt: 0.5,
    maxSpeed: 3,
    maxNut: 200,
    nutrition: 200,
    chasePriority: 2,
    fleePriority: -1,
    color: [82, 179, 217],
    radius: 8,
    steer: steer
};

var predTemplate = {
    accAmt: 0.1,
    maxSpeed: 4,
    maxNut: 400,
    nutrition: 400,
    chasePriority: 2,
    color: [207, 0, 15],
    radius: 12,
    steer: steer
};

var fungusTemplate = {
    maxNut: 500,
    nutrition: 500,
    color: [102, 51, 153],
    radius: 10
};

var missileTemplate = {
    accAmt: 1,
    maxSpeed: 5,
    maxNut: 300,
    nutrition: 300,
    chasePriority: 1,
    fleePriority: -0.5,
    color: [249, 191, 59],
    radius: 8,
    steer: trackTarget
};

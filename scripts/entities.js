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
        sum.add(this.target(this.getNearest(targets), 1));
    }
    // avoiding
    for (var i = 0; i < avoid.length; ++i) {
        if (avoid[i] === this) continue;
        sum.add(this.target(avoid[i], -1));
    }
    // TODO edge avoidance
    this.acc = sum.limit(this.accAmt);
}


var foodTemplate = {
    color: [135, 211, 124],
    starve: false
};

var preyTemplate = {
    accAmt: 0.4,
    maxSpeed: 3,
    maxNut: 200,
    nutrition: 200,
    color: [82, 179, 217],
    radius: 8,
    steer: steer
};

var predTemplate = {
    accAmt: 0.4,
    maxSpeed: 4,
    maxNut: 400,
    nutrition: 400,
    color: [207, 0, 15],
    radius: 12,
    steer: steer
};

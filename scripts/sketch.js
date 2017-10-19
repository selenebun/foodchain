var entities;
var newEntities;
var selected = 'b';

var numFood = 30;
var numPrey = 20;
var numPred = 10;
var numTurret = 1;

var chaseLines = false;
var fleeLines = false;
var showNutrition = true;
var showPerception = false;


// Misc functions

function initEntities() {
    entities = [];
    newEntities = [];
    for (var i = 0; i < numFood; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, foodTemplate));
    }
    for (var i = 0; i < numPrey; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, preyTemplate));
    }
    for (var i = 0; i < numPred; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, predTemplate));
    }
    for (var i = 0; i < numTurret; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, turretTemplate));
    }
}

function removeDead() {
    for (var i = entities.length - 1; i >= 0; --i) {
        var e = entities[i];
        if (e.alive) continue;
        entities.splice(i, 1);
        e.onDeath(newEntities);
    }
}


// Main p5 functions

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    initEntities();
}

function draw() {
    background(255);
    
    var total = entities.length;
    var numCreatures = getByType(entities, ['prey', 'pred', 'turret']).length;
    if (total <= 1 || total > 800 || numCreatures === 0) initEntities();

    if (random(5) < 1) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, foodTemplate));
    }

    for (var i = 0; i < entities.length; ++i) {
        var e = entities[i];
        // Steering
        var visible = e.getVisible(entities);
        var relevant = getByType(visible, e.chase.concat(e.flee));
        var f;
        if (relevant.length === 0) {
            f = e.wander();
        } else {
            f = e.steer(relevant, newEntities).limit(e.accAmt);
        }
        // Update
        e.applyForce(f);
        e.update();
        e.edges(width, height);
        if (e.outsideRect(0, 0, width, height)) e.kill();
        e.hunger(newEntities);
        // Drawing
        e.draw();
        // Eating
        var targets = getByType(visible, e.chase);
        for (var j = 0; j < targets.length; ++j) {
            var t = targets[j];
            if (e.isInside(t.pos.x, t.pos.y)) e.onEatAttempt(t, newEntities);
        }
    }

    removeDead();
    entities = entities.concat(newEntities);
    newEntities = [];
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 13:
            // Enter
            initEntities();
            break;
        case 16:
            // Shift
            showPerception = !showPerception;
            break;
        case 18:
            // Alt
            fleeLines = !fleeLines;
            break;
        case 32:
            // Space bar
            chaseLines = !chaseLines;
            break;
        case 66:
            // B
            selected = 'b';
            break;
        case 70:
            // F
            selected = 'f';
            break;
        case 78:
            // N
            showNutrition = !showNutrition;
            break;
        case 80:
            // P
            selected = 'p';
            break;
        case 84:
            // T
            selected = 't';
            break;
    }
}

function mousePressed() {
    switch(selected) {
        case 'b':
            entities.push(createEntity(mouseX, mouseY, preyTemplate));
            break;
        case 'f':
            entities.push(createEntity(mouseX, mouseY, foodTemplate));
            break;
        case 'p':
            entities.push(createEntity(mouseX, mouseY, predTemplate));
            break;
        case 't':
            entities.push(createEntity(mouseX, mouseY, turretTemplate));
            break;
    }
}

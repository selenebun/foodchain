var entities;
var newEntities;
var selected = 'b';

var presets = [
    {
        'numFood': 30,
        'numPrey': 20,
        'numPred': 10,
        'numTurret': 0,
        'numHive': 0,
        'numFungus': 0
    },
    {
        'numFood': 30,
        'numPrey': 20,
        'numPred': 10,
        'numTurret': 0,
        'numHive': 1,
        'numFungus': 4
    }
];
var currentPreset = 0;

var chaseLines = false;
var fleeLines = false;
var showNutrition = true;
var showPerception = false;
var showChart = false;


// Misc functions

function initEntities() {
    var preset = presets[currentPreset];
    entities = [];
    newEntities = [];
    for (var i = 0; i < preset.numFood; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, foodTemplate));
    }
    for (var i = 0; i < preset.numPrey; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, preyTemplate));
    }
    for (var i = 0; i < preset.numPred; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, predTemplate));
    }
    for (var i = 0; i < preset.numTurret; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, turretTemplate));
    }
    for (var i = 0; i < preset.numHive; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, hiveTemplate));
    }
    for (var i = 0; i < preset.numFungus; ++i) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, fungusTemplate));
    }
}

function pieChart(entities) {
    var numFood = getByType(entities, ['food']).length;
    var numPrey = getByType(entities, ['prey']).length;
    var numPred = getByType(entities, ['pred']).length;
    var numHive = getByType(entities, ['hive']).length;
    var numFungus = getByType(entities, ['fungus']).length;
    var numCreatures = getByType(entities, [
        'food', 'prey', 'pred', 'hive', 'fungus'
    ]).length;

    var nums = [numFood, numPrey, numHive, numPred, numFungus];
    var colors = [
        foodTemplate.color, preyTemplate.color, swarmTemplate.color,
        predTemplate.color, fungusTemplate.color
    ];
    var angles = [];
    for (var i = 0; i < nums.length; ++i) {
        angles[i] = nums[i] / numCreatures * TWO_PI;
    }

    var diam = 100;
    var lastAngle = 0;
    for (var i = 0; i < angles.length; ++i) {
        if (angles[i] === 0) continue;
        // Arc
        fill(colors[i].concat(127));
        stroke(0, 127);
        arc(width - 75, 75, diam, diam, lastAngle, lastAngle + angles[i]);
        // Line
        var dx = width - 75 + diam / 2 * Math.cos(lastAngle);
        var dy = 75 + diam / 2 * Math.sin(lastAngle);
        line(width - 75, 75, dx, dy);
        lastAngle += angles[i];
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
    var numCreatures = getByType(entities, [
        'prey', 'pred', 'bullet', 'swarm', 'swarmer'
    ]).length;
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
        // Misc
        e.onFrame(newEntities);
        // Eating
        var targets = getByType(visible, e.chase);
        for (var j = 0; j < targets.length; ++j) {
            var t = targets[j];
            if (e.isInside(t.pos.x, t.pos.y)) e.onEatAttempt(t, newEntities);
        }
    }

    if (showChart) pieChart(entities);

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
        case 17:
            // Ctrl
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
        case 48:
            // 0
            if (currentPreset !== 0) {
                currentPreset = 0;
                initEntities();
            }
            break;
        case 49:
            // 1
            if (currentPreset !== 1) {
                currentPreset = 1;
                initEntities();
            }
            break;
        case 66:
            // B
            selected = 'b';
            break;
        case 70:
            // F
            selected = 'f';
            break;
        case 71:
            // G
            showChart = !showChart;
            break;
        case 72:
            // H
            selected = 'h';
            break;
        case 78:
            // N
            showNutrition = !showNutrition;
            break;
        case 80:
            // P
            selected = 'p';
            break;
        case 83:
            // S
            selected = 's';
            break;
        case 84:
            // T
            selected = 't';
            break;
        case 86:
            // V
            selected = 'v';
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
        case 'h':
            entities.push(createEntity(mouseX, mouseY, hiveTemplate));
            break;
        case 'p':
            entities.push(createEntity(mouseX, mouseY, predTemplate));
            break;
        case 's':
            entities.push(createEntity(mouseX, mouseY, swarmTemplate));
            break;
        case 't':
            entities.push(createEntity(mouseX, mouseY, turretTemplate));
            break;
        case 'v':
            entities.push(createEntity(mouseX, mouseY, fungusTemplate));
            break;
    }
}

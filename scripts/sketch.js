var entities;
var newEntities;
var selected = 'prey';

var presets = [
    {
        num: {
            food: 30,
            pred: 10,
            prey: 20
        },
        custom: []
    },
    {
        num: {
            food: 30,
            fungus: 4,
            hive: 1,
            pred: 10,
            prey: 20
        },
        custom: []
    },
    {
        num: {
            food: 30,
            prey: 20
        },
        custom: []
    },
    {
        num: {
            prey: 20
        },
        custom: [
            {
                name: 'fungus',
                x: 0,
                y: 0 
            },
            {
                name: 'fungus',
                x: 100,
                y: 100
            },
            {
                name: 'fungus',
                x: 200,
                y: 200
            },
            {
                name: 'fungus',
                x: 300,
                y: 300
            },
            {
                name: 'fungus',
                x: 400,
                y: 400
            }
        ]
    }
];
var currentPreset = 0;

var avoidLines = false;
var chaseLines = false;
var lineMode = false;
var motionBlur = false;
var showChart = false;
var showNutrition = true;
var showPerception = false;

var menuVisible = true;
var sidebarOpen = false;


// Misc functions

// Set position to inside map and adjust velocity
function bounceOffEdges(e) {
    var dv = -4;
    if (e.pos.x - e.radius < 0) {
        e.pos.x = e.radius;
        e.vel.x *= dv;
    }
    if (e.pos.x + e.radius > width) {
        e.pos.x = width - e.radius;
        e.vel.x *= dv;
    }
    if (e.pos.y - e.radius < 0) {
        e.pos.y = e.radius;
        e.vel.y *= dv;
    }
    if (e.pos.y + e.radius > height) {
        e.pos.y = height - e.radius;
        e.vel.y *= dv;
    }
}

// Create entity at mouse position
function drawEntity() {
    if (sidebarOpen && mouseX < 220) return;
    if (menuVisible && mouseX < 220 && mouseY < 30) return;
    entities.push(createEntity(mouseX, mouseY, templates[selected]));
}

function initEntities() {
    entities = [];
    newEntities = [];
    // Setup map from preset
    var preset = presets[currentPreset];
    var keys = Object.keys(preset.num);
    for (var i = 0; i < keys.length; i++) {
        var template = keys[i];
        var count = preset.num[template];
        for (var j = 0; j < count; j++) {
            var x = random(width);
            var y = random(height);
            entities.push(createEntity(x, y, templates[template]));
        }
    }

    // Spawn custom entities
    for (var i = 0; i < preset.custom.length; i++) {
        var e = preset.custom[i];
        entities.push(createEntity(e.x, e.y, templates[e.name]));
    }
}

function isOutsideMap(e) {
    return isOutsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
}

// Draw pie chart to show ratio of each type of entity
function pieChart(entities) {
    var total = getByName(entities, [
        'food', 'prey', 'pred', 'hive', 'swarm', 'fungus'
    ]).length;
    var nums = [
        getByName(entities, 'food').length,
        getByName(entities, 'prey').length,
        getByName(entities, ['hive', 'swarm']).length,
        getByName(entities, 'pred').length,
        getByName(entities, 'fungus').length,
    ];
    var colors = [
        templates.food.color, templates.prey.color, templates.swarm.color,
        templates.pred.color, templates.fungus.color
    ];
    
    // Calculate angles
    var angles = [];
    for (var i = 0; i < nums.length; i++) {
        angles[i] = nums[i] / total * TWO_PI;
    }

    // Draw pie chart
    var diam = 150;
    var lastAngle = 0;
    for (var i = 0; i < angles.length; i++) {
        if (angles[i] === 0) continue;
        // Arc
        fill(colors[i].concat(191));
        noStroke();
        arc(width - 100, 100, diam, diam, lastAngle, lastAngle + angles[i]);
        lastAngle += angles[i];
    }
}

// Clear dead entities from entities array
function removeDead(entities) {
    for (var i = entities.length - 1; i >= 0; i--) {
        var e = entities[i];
        if (e.alive) continue;
        entities.splice(i, 1);
        e.onDeath(newEntities);
    }
}

function toggleMenu() {
    sidebarOpen = !sidebarOpen;
    var m = document.getElementById('menu');
    if (sidebarOpen && menuVisible) {
        m.style.display = 'block';
    } else {
        m.style.display = 'none';
    }
}


// Main p5 functions

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    initEntities();
}

function draw() {
    // Make background slightly transparent for motion blur
    if (motionBlur) {
        background(0, 63);
    } else {
        background(0);
    }

    // Restart if there are not too many entities or too few dynamic entities
    var total = entities.length;
    var numDynamic = getByName(entities, [
        'pred', 'prey', 'swarm', 'swarmer'
    ]).length;
    if (total <= 0 || total > 1200 || numDynamic === 0) initEntities();

    // Randomly spawn food on map
    if (random(5) < 1) {
        var x = random(width);
        var y = random(height);
        entities.push(createEntity(x, y, templates.food));
    }

    // Update and draw all entities
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        // Steering
        var visible = e.getVisible(entities);
        var names = e.toChase.concat(e.toEat).concat(e.toFlee);
        var relevant = getByName(visible, names);
        var f;
        if (relevant.length === 0) {
            f = e.wander(newEntities);
        } else {
            f = e.steer(relevant, newEntities);
        }
        // Update
        e.applyForce(f.limit(e.accAmt));
        e.update();
        bounceOffEdges(e);
        if (isOutsideMap(e)) e.kill();
        e.hunger(newEntities);
        // Draw
        e.draw(lineMode, showPerception, showNutrition);
        // Misc
        e.onFrame(newEntities);
        // Eating
        var targets = getByName(visible, e.toEat);
        for (var j = 0; j < targets.length; j++) {
            var t = targets[j];
            if (e.contains(t.pos.x, t.pos.y)) e.onEatAttempt(t, newEntities);
        }
    }

    // Draw pie chart
    if (showChart) pieChart(entities);

    removeDead(entities);
    entities = entities.concat(newEntities);
    newEntities = [];
}


// Misc p5 functions

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initEntities();
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
            avoidLines = !avoidLines;
            break;
        case 32:
            // Spacebar
            chaseLines = !chaseLines;
            break;
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            // 0-9
            var n = keyCode - 48;
            if (currentPreset !== n && presets.length > n) {
                currentPreset = n;
                initEntities();
            }
            break;
        case 66:
            // B
            selected = 'prey';
            break;
        case 70:
            // F
            selected = 'food';
            break;
        case 71:
            // G
            showChart = !showChart;
            break;
        case 72:
            // H
            selected = 'hive';
            break;
        case 77:
            // M
            lineMode = !lineMode;
            if (lineMode) {
                avoidLines = true;
                chaseLines = true;
            } else {
                avoidLines = false;
                chaseLines = false;
            }
            break;
        case 78:
            // N
            showNutrition = !showNutrition;
            break;
        case 79:
            // O
            motionBlur = !motionBlur;
            break;
        case 80:
            // P
            selected = 'pred';
            break;
        case 81:
            // Q
            menuVisible = !menuVisible;
            var b = document.getElementById('menu-button');
            var m = document.getElementById('menu');
            if (menuVisible) {
                b.style.display = 'inline';
            } else {
                b.style.display = 'none';
                m.style.display = 'none';
            }
            break;
        case 83:
            // S
            selected = 'swarm';
            break;
        case 86:
            // V
            selected = 'fungus';
            break;
    }
}

function mousePressed() {
    drawEntity();
}

function mouseDragged() {
    drawEntity();
}

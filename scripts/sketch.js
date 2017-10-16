var food;
var prey;
var pred;
var fungus;
var missile;

var foodCount = 30;
var preyCount = 20;
var predCount = 10;
var fungusCount = 4;
var missileCount = 4;

var selected = 'b';
var targetLines = false;


// Misc functions

function initCreatures() {
    food = [];
    for (var i = 0; i < foodCount; ++i) {
        var x = random(width);
        var y = random(height);
        food[i] = createEntity(x, y, foodTemplate);
    }

    prey = [];
    for (var i = 0; i < preyCount; ++i) {
        var x = random(width);
        var y = random(height);
        prey[i] = createEntity(x, y, preyTemplate);
    }

    pred = [];
    for (var i = 0; i < predCount; ++i) {
        var x = random(width);
        var y = random(height);
        pred[i] = createEntity(x, y, predTemplate);
    }

    fungus = []
    for (var i = 0; i < fungusCount; ++i) {
        var x = random(width);
        var y = random(height);
        fungus[i] = createEntity(x, y, fungusTemplate);
    }

    missile = [];
    for (var i = 0; i < missileCount; ++i) {
        var x = random(width);
        var y = random(height);
        missile[i] = createEntity(x, y, missileTemplate);
    }
}

function removeDead() {
    for (var i = food.length - 1; i >= 0; --i) {
        if (!food[i].alive) food.splice(i, 1);
    }

    for (var i = prey.length - 1; i >= 0; --i) {
        if (!prey[i].alive) prey.splice(i, 1);
    }

    for (var i = pred.length - 1; i >= 0; --i) {
        if (!pred[i].alive) {
            if (random(3) < 2) {
                var x = pred[i].pos.x + random(-20, 20);
                var y = pred[i].pos.y + random(-20, 20);
                food.push(createEntity(x, y, foodTemplate))
            }
            pred.splice(i, 1);
        }
    }

    for (var i = fungus.length - 1; i >= 0; --i) {
        if (!fungus[i].alive) {
            var x = fungus[i].pos.x;
            var y = fungus[i].pos.y;
            food.push(createEntity(x, y, foodTemplate))
            fungus.splice(i, 1);
        }
    }

    for (var i = missile.length - 1; i >= 0; --i) {
        if (!missile[i].alive) {
            if (random(3) < 2) {
                var x = missile[i].pos.x;
                var y = missile[i].pos.y;
                fungus.push(createEntity(x, y, fungusTemplate))
            }
            missile.splice(i, 1);
        }
    }
}


// Main p5 functions

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    initCreatures();
}

function draw() {
    background(255);

    var total = food.length + prey.length + pred.length + fungus.length +
    missile.length;
    var numCreatures = prey.length + pred.length + missile.length +
    fungus.length;
    if (total <= 1 || total > 600 || numCreatures === 0) initCreatures();

    if (random(20) < 1) {
        food.push(createEntity(random(width), random(height), foodTemplate));
    }

    for (var i = 0; i < food.length; ++i) {
        var f = food[i];
        f.edges();
        f.update();
        if (f.outsideBorders()) f.kill();
        f.draw();
    }

    for (var i = 0; i < prey.length; ++i) {
        var p = prey[i];
        p.steer(food, pred.concat(prey));
        p.edges();
        p.update();
        if (p.outsideBorders()) p.kill();
        p.draw();

        // eating
        if (food.length === 0) continue;
        var f = p.getNearest(food);
        var cx = p.pos.x;
        var cy = p.pos.y;
        var fx = f.pos.x;
        var fy = f.pos.y;
        if (sq(fx - cx) + sq(fy - cy) < sq(p.radius)) {
            this.nutrition += f.nutrition;
            f.kill();
            var dx = cx + random(-20, 20);
            var dy = cy + random(-20, 20);
            prey.push(createEntity(dx, dy, preyTemplate));
        }
    }

    for (var i = 0; i < pred.length; ++i) {
        var p = pred[i];
        p.steer(prey.concat(missile), []);
        p.edges();
        p.update();
        if (p.outsideBorders()) p.kill();
        p.draw();

        // eating
        if (prey.length !== 0) {
            var b = p.getNearest(prey);
            var cx = p.pos.x;
            var cy = p.pos.y;
            var bx = b.pos.x;
            var by = b.pos.y;
            if (sq(bx - cx) + sq(by - cy) < sq(p.radius)) {
                this.nutrition += b.nutrition;
                b.kill();
                if (random(3) < 1) {
                    var dx = cx + random(-20, 20);
                    var dy = cy + random(-20, 20);
                    pred.push(createEntity(dx, dy, predTemplate));
                }
            }
        }

        if (missile.length === 0) continue;
        var b = p.getNearest(missile);
        var cx = p.pos.x;
        var cy = p.pos.y;
        var bx = b.pos.x;
        var by = b.pos.y;
        if (sq(bx - cx) + sq(by - cy) < sq(p.radius)) {
            this.nutrition += b.nutrition;
            b.kill();
            var dx = cx + random(-20, 20);
            var dy = cy + random(-20, 20);
            pred.push(createEntity(dx, dy, predTemplate));
        }
    }

    for (var i = 0; i < fungus.length; ++i) {
        var p = fungus[i];
        p.edges();
        p.update();
        if (p.outsideBorders()) p.kill();
        p.draw();

        // eating
        if (prey.length === 0) continue;
        var b = p.getNearest(prey);
        var cx = p.pos.x;
        var cy = p.pos.y;
        var bx = b.pos.x;
        var by = b.pos.y;
        if (sq(bx - cx) + sq(by - cy) < sq(p.radius)) {
            this.nutrition += b.nutrition;
            b.kill();
            if (random(2) < 1) {
                var dx = cx + random(-20, 20);
                var dy = cy + random(-20, 20);
                food.push(createEntity(dx, dy, foodTemplate));
            }
            var dx = cx + random(-100, 100);
            var dy = cy + random(-100, 100);
            fungus.push(createEntity(dx, dy, fungusTemplate));
        }
    }

    for (var i = 0; i < missile.length; ++i) {
        var p = missile[i];
        p.steer(fungus.concat(prey), pred.concat(missile));
        p.edges();
        p.update();
        if (p.outsideBorders()) p.kill();
        p.draw();

        if (prey.length !== 0) {
            var b = p.getNearest(prey);
            var cx = p.pos.x;
            var cy = p.pos.y;
            var bx = b.pos.x;
            var by = b.pos.y;
            if (sq(bx - cx) + sq(by - cy) < sq(p.radius)) {
                this.nutrition += b.nutrition;
                b.kill();
                if (random(3) < 1) {
                    var dx = cx + random(-20, 20);
                    var dy = cy + random(-20, 20);
                    missile.push(createEntity(dx, dy, missileTemplate));
                }
            }
        }

        // eating
        if (fungus.length === 0) continue;
        var b = p.getNearest(fungus);
        var cx = p.pos.x;
        var cy = p.pos.y;
        var bx = b.pos.x;
        var by = b.pos.y;
        if (sq(bx - cx) + sq(by - cy) < sq(p.radius)) {
            this.nutrition += b.nutrition;
            b.kill();
            if (random(2) < 1) {
                var dx = cx + random(-20, 20);
                var dy = cy + random(-20, 20);
                missile.push(createEntity(dx, dy, missileTemplate));
            }
        }
    }

    removeDead();
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 13:
            // Enter
            initCreatures();
            break;
        case 32:
            // Space bar
            targetLines = !targetLines;
            break;
        case 66:
            // B
            selected = 'b';
            break;
        case 70:
            // F
            selected = 'f';
            break;
        case 77:
            // M
            selected = 'm';
            break;
        case 80:
            // P
            selected = 'p';
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
            prey.push(createEntity(mouseX, mouseY, preyTemplate));
            break;
        case 'f':
            food.push(createEntity(mouseX, mouseY, foodTemplate));
            break;
        case 'm':
            missile.push(createEntity(mouseX, mouseY, missileTemplate));
            break;
        case 'p':
            pred.push(createEntity(mouseX, mouseY, predTemplate));
            break;
        case 'v':
            fungus.push(createEntity(mouseX, mouseY, fungusTemplate));
            break;
    }
}

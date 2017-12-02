class Entity {
    constructor(x, y) {
        // Physics
        this.mass = 1;
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.accAmt = 0.1;
        this.topSpeed = 10;
        // Nutrition
        this.nutrition = 50;
        this.maxNutrition = this.nutrition;
        // AI
        this.toAvoid = [];
        this.toChase = [];
        this.toEat = [];
        this.avoidPriority = 1;
        this.chasePriority = 1;
        this.perception = 0;
        // Display
        this.color = [0, 0, 0];
        this.radius = 5;
        // Misc
        this.alive = true;
        this.name = 'entity';
        this.template = {};
    }

    applyForce(f) {
        this.acc.add(f.div(this.mass));
    }

    // Check if point is inside
    contains(x, y) {
        return isInsideCircle(x, y, this.pos.x, this.pos.y, this.radius);
    }

    draw(lineMode, showPerception, showNutrition) {
        // Draw transparent circle around entity at perception radius
        noStroke();
        if (showPerception) {
            var p = this.perception;
            fill(this.color[0], this.color[1], this.color[2], 31);
            ellipse(this.pos.x, this.pos.y, p * 2, p * 2);
        }

        // Decrease opacity as nutrition level goes down
        var alpha = 255;
        if (showNutrition) alpha = 255 * this.nutrition / this.maxNutrition;
        fill(this.color[0], this.color[1], this.color[2], alpha);

        // Do not draw entity on line mode
        if (!lineMode) {
            ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
        }
    }

    // Returns true if ate entity successfully
    eat(e) {
        // Do not eat already dead entities
        if (!e.alive) return false;
        e.kill();
        
        // Add nutrition, ensure it does not go over
        this.nutrition += e.nutrition;
        if (this.nutrition > this.maxNutrition) {
            this.nutrition = this.maxNutrition;
        }
        return true;
    }

    getNearest(entities) {
        var lowestDist = 1000000;
        var e = entities[0];
        for (var i = 0; i < entities.length; i++) {
            var dist = entities[i].pos.dist(this.pos);
            if (dist < lowestDist) {
                lowestDist = dist;
                e = entities[i];
            }
        }
        return e;
    }

    getVisible(entities) {
        var visible = [];
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            if (e === this) continue;
            var c = this.pos;
            if (isInsideCircle(e.pos.x, e.pos.y, c.x, c.y, this.perception)) {
                visible.push(e);
            }
        }
        return visible;
    }

    // Reduces nutrition level, kills if nutrition is 0
    hunger(newEntities) {
        this.nutrition--;
        if (this.nutrition <= 0) {
            this.kill();
            this.onStarve(newEntities);
        }
    }

    kill() {
        this.alive = false;
    }

    onAvoid(e, newEntities) {}
    onChase(e, newEntities) {}
    onDeath(newEntities) {}

    onEatAttempt(e, newEntities) {
        if (this.onEat(e, newEntities)) e.onEaten(this, newEntities);
    }

    onEat(e, newEntities) {
        return this.eat(e);
    }

    onEaten(e, newEntities) {}
    onFrame(e, newEntities) {}
    onStarve(newEntities) {}
    onWander(newEntities) {}

    // Returns a steering vector
    steer(entities, newEntities) {
        return createVector(0, 0);
    }

    // Returns steering vector towards specific entity
    // End length is acceleration amount * multiplier
    target(e, mult) {
        var dist = e.pos.dist(this.pos);
        var unit = p5.Vector.sub(e.pos, this.pos).normalize();
        return unit.mult(this.accAmt * mult);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.topSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    // Accelerate in random direction
    wander(newEntities) {
        this.onWander(newEntities);
        var angle = random(TWO_PI);
        var mag = this.accAmt;
        return createVector(mag * Math.cos(angle), mag * Math.sin(angle));
    }
}

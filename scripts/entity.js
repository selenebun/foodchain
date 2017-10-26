class Entity {
    constructor(x, y) {
        this.mass = 1;
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);

        this.accAmt = 0.1;
        this.topSpeed = 10;

        this.nutrition = 50;
        this.maxNut = this.nutrition;
        this.perception = 0;

        this.chase = [];
        this.flee = [];
        this.chasePriority = 1;
        this.fleePriority = 1;

        this.color = [0, 0, 0];
        this.name = 'entity';
        this.radius = 5;
        this.template = {};

        this.alive = true;
    }

    draw() {
        if (showPerception) {
            var p = this.perception;
            fill(this.color[0], this.color[1], this.color[2], 31);
            stroke(0, 31);
            ellipse(this.pos.x, this.pos.y, p * 2, p * 2);
        }
        if (showNutrition) {
            var alpha = 255 * this.nutrition / this.maxNut;
            fill(this.color[0], this.color[1], this.color[2], alpha);
        } else {
            fill(this.color[0], this.color[1], this.color[2]);
        }
        if (dispMode === 0) {
            stroke(0);
        } else if (dispMode === 1) {
            noStroke();
        }
        if (dispMode !== 2) {
            ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
        }
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.topSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    applyForce(f) {
        this.acc.add(f.div(this.mass));
    }

    eat(e) {
        if (!e.alive) return;
        e.kill();
        this.nutrition += e.nutrition;
        if (this.nutrition > this.maxNut) this.nutrition = this.maxNut;
    }

    edges(width, height) {
        var dv = -4;
        if (this.pos.x + this.radius > width) {
            this.pos.x = width - this.radius;
            this.vel.x *= dv;
        }
        if (this.pos.x - this.radius < 0) {
            this.pos.x = this.radius;
            this.vel.x *= dv;
        }
        if (this.pos.y + this.radius > height) {
            this.pos.y = height - this.radius;
            this.vel.y *= dv;
        }
        if (this.pos.y - this.radius < 0) {
            this.pos.y = this.radius;
            this.vel.y *= dv;
        }
    }

    getNearest(entities) {
        var lowestDist = 10000;
        var entity = entities[0];
        for (var i = 0; i < entities.length; ++i) {
            var dist = entities[i].pos.dist(this.pos);
            if (dist < lowestDist) {
                lowestDist = dist;
                entity = entities[i];
            }
        }
        return entity;
    }

    getVisible(entities) {
        var visible = [];
        for (var i = 0; i < entities.length; ++i) {
            var e = entities[i];
            if (e === this) continue;
            var c = this.pos;
            if (insideCircle(e.pos.x, e.pos.y, c.x, c.y, this.perception)) {
                visible.push(e);
            }
        }
        return visible;
    }

    hunger(newEntities) {
        this.nutrition--;
        if (this.nutrition <= 0) {
            this.kill();
            this.onStarve(newEntities);
        }
    }

    isInside(x, y) {
        return insideCircle(x, y, this.pos.x, this.pos.y, this.radius);
    }

    insideRect(x, y, w, h) {
        return this.pos.x + this.radius > x && this.pos.y + this.radius > y &&
        this.pos.x - this.radius < x + w && this.pos.y - this.radius < y + h;
    }

    outsideRect(x, y, w, h) {
        return this.pos.x + this.radius < x || this.pos.y + this.radius < y ||
        this.pos.x - this.radius > x + w || this.pos.y - this.radius > y + h;
    }

    kill() {
        this.alive = false;
    }

    onChase(e, newEntities) {}

    onDeath(newEntities) {}

    onEatAttempt(e, newEntities) {
        this.onEat(e, newEntities);
        e.onEaten(this, newEntities);
    }

    onEat(e, newEntities) {
        this.eat(e);
    }

    onEaten(e, newEntities) {}

    onFlee(e, newEntities) {}

    onFrame(newEntities) {}

    onStarve(newEntities) {}

    steer(entities, newEntities) {
        return createVector(0, 0);
    }

    target(e, mult) {
        var dist = e.pos.dist(this.pos);
        var unit = p5.Vector.sub(e.pos, this.pos).normalize();
        //var priority = 100 / dist;
        return unit.mult(this.accAmt * mult);
    }

    wander() {
        var angle = random(TWO_PI);
        var mag = this.accAmt;
        return createVector(mag * Math.cos(angle), mag * Math.sin(angle));
    }
}

class Entity {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.alive = true;
        this.accAmt = 0;
        this.maxSpeed = 0;
        this.maxNut = 50;
        this.nutrition = 50;
        this.starve = true;
        this.chasePriority = 1;
        this.fleePriority = -1;
        this.following;

        this.color = [0, 0, 0];
        this.radius = 5;
    }

    draw() {
        var alpha = this.nutrition / this.maxNut * 255;
        fill(this.color[0], this.color[1], this.color[2], alpha);
        stroke(0);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }

    edges() {
        var d = 20;
        var a = 10;
        if (this.pos.x < d) {
            this.acc.add(a / (d - this.pos.x), 0).limit(this.accAmt);
        }
        if (this.pos.x > width - d) {
            this.acc.add(-a / (-width + d + this.pos.x), 0).limit(this.accAmt);
        }
        if (this.pos.y < d) {
            this.acc.add(0, a / (d - this.pos.y)).limit(this.accAmt);
        }
        if (this.pos.y > height - d) {
            this.acc.add(0, -a / (-height + d + this.pos.y)).limit(this.accAmt);
        }
    }

    getNearest(entities) {
        var lowestDist = 1000000;
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

    kill() {
        this.alive = false;
    }

    outsideBorders() {
        return (
            this.pos.x + this.radius < 0 || this.pos.x - this.radius > width ||
            this.pos.y + this.radius < 0 || this.pos.y - this.radius > height
        );
    }

    steer(targets, avoid) {}

    target(entity, mult) {
        var dist = entity.pos.dist(this.pos);
        var unit = p5.Vector.sub(entity.pos, this.pos).normalize();
        var priority = 100 / dist;
        return unit.mult(this.accAmt * mult * priority);
    }
    
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        if (this.starve) this.nutrition--;
        if (this.nutrition === 0) this.kill();
    }
}

class Entity {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.alive = true;
        this.accAmt = 0;
        this.maxSpeed = 0;

        this.color = 'rgb(0,0,0)';
        this.radius = 5;
    }

    draw() {
        fill(this.color);
        stroke(0);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
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
    }
}

// Get array of entities that have a name in the array of names
function getByName(entities, names) {
    var results = [];
    if (typeof names === 'string') names = [names];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        for (var j = 0; j < names.length; j++) {
            if (e.name === names[j]) results.push(e);
        }
    }
    return results;
}

function isInsideCircle(x, y, cx, cy, r) {
    return sq(x - cx) + sq(y - cy) < sq(r);
}

function isOutsideRect(x, y, cx, cy, w, h) {
    return x < cx || y < cy || x > cx + w || y > cy + h;
}

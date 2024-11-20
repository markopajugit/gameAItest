// fastEnemy.js

const Enemy = require('./enemy'); // Use CommonJS `require`

class FastEnemy extends Enemy {
    constructor(path) {
        super(path, 50, 3, 'blue', 10); // Low health, high speed, 10 gold reward
        this.size = 8;
    }
}

module.exports = FastEnemy;

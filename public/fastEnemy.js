import { Enemy } from './enemy.js';

export class FastEnemy extends Enemy {
    constructor(path) {
        super(path, 50, 4, 'blue'); // Lower health, higher speed, blue color
        this.size = 8; // Smaller size
    }
}

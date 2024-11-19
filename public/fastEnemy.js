import { Enemy } from './enemy.js';

export class FastEnemy extends Enemy {
    constructor(path) {
        super(path, 50, 4, 'blue', 10); // Low health, high speed, 10 reward
        this.size = 8;
    }
}

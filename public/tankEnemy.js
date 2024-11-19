import { Enemy } from './enemy.js';

export class TankEnemy extends Enemy {
    constructor(path) {
        super(path, 200, 1, 'green'); // High health, slower speed, green color
        this.size = 15; // Larger size
    }
}
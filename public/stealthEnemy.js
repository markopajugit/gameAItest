import { Enemy } from './enemy.js';

export class StealthEnemy extends Enemy {
    constructor(path) {
        super(path, 80, 3, 'purple'); // Moderate health, moderate speed, purple color
    }

    // Override draw method for unique stealth effect (optional)
    draw(ctx) {
        ctx.globalAlpha = 0.5; // Semi-transparent
        super.draw(ctx);
        ctx.globalAlpha = 1.0; // Reset transparency
    }
}
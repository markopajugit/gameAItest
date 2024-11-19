import { Tower } from './tower.js';

export class FastTower extends Tower {
    constructor(x, y, tileSize) {
        super(x, y, tileSize, 100, 10, 5); // Smaller range, lower damage, higher attack speed
    }

    // Optionally, override the draw method for a unique appearance
    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);
    }
}

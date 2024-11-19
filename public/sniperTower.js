import { Tower } from './tower.js';

export class SniperTower extends Tower {
    constructor(x, y, tileSize) {
        super(x, y, tileSize, 300, 40, 0.5); // Long range, high damage, slow attack speed
    }

    // Optionally, override the draw method for a unique appearance
    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = 'purple';
        ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);
    }
}

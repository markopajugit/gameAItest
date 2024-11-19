import { Tower } from './tower.js';

export class AreaTower extends Tower {
    constructor(x, y, tileSize) {
        super(x, y, tileSize, 150, 10, 1); // Medium range, medium damage, moderate attack speed
    }

    // Override attack to apply area damage
    attack(enemies, currentTime) {
        // Only attack if enough time has passed since the last attack
        if (currentTime - this.lastAttackTime >= 1000 / this.attackSpeed) {
            // Filter enemies in range
            const enemiesInRange = enemies.filter(enemy => this.isEnemyInRange(enemy));

            // Apply damage to all enemies in range
            enemiesInRange.forEach(enemy => {
                enemy.takeDamage(this.damage);
            });

            this.lastAttackTime = currentTime; // Update last attack time
        }
    }

    // Optionally, override the draw method for a unique appearance
    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);
    }
}

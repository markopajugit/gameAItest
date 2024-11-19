import { Tower } from './tower.js';

export class AreaTower extends Tower {
    constructor(x, y, tileSize) {
        super(x, y, tileSize, 150, 10, 1); // Medium range, medium damage, moderate attack speed
    }

    // Override attack to apply area damage
    attack(enemies, currentTime) {
        // Check if enough time has passed since the last attack
        if (currentTime - this.lastAttackTime >= 1000 / this.attackSpeed) {
            // Filter enemies that are within the tower's range
            const enemiesInRange = enemies.filter(enemy => this.isEnemyInRange(enemy));

            // Apply damage to all enemies in range
            enemiesInRange.forEach(enemy => {
                console.log(`AreaTower damaging enemy at (${enemy.x}, ${enemy.y})`);
                enemy.takeDamage(this.damage);
            });

            // Update the last attack time
            this.lastAttackTime = currentTime;
        }
    }

    // Optionally, override the draw method for a unique appearance
    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);
    }
}

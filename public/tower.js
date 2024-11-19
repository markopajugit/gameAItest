export class Tower {
    constructor(x, y, tileSize, range = 100, damage = 1, attackSpeed = 1) {
        this.x = x; // Top-left corner x-coordinate of the tower
        this.y = y; // Top-left corner y-coordinate of the tower
        this.tileSize = tileSize; // Size of the tile the tower occupies
        this.range = range; // Damage range of the tower
        this.damage = damage; // Damage per attack
        this.attackSpeed = attackSpeed; // How often the tower attacks (times per second)
        this.lastAttackTime = 0; // Tracks the last time the tower attacked
    }

    // Draw the tower and its range
    draw(ctx) {
        // Draw the tower as a green square
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);

        // Draw the damage range
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Semi-transparent green
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            this.x + this.tileSize / 2, // Center x (middle of the tile)
            this.y + this.tileSize / 2, // Center y (middle of the tile)
            this.range, // Radius
            0, // Start angle
            Math.PI * 2 // End angle (full circle)
        );
        ctx.stroke();
    }

    // Check if an enemy is within range
    isEnemyInRange(enemy) {
        const centerX = this.x + this.tileSize / 2;
        const centerY = this.y + this.tileSize / 2;
        const distance = Math.sqrt(
            (enemy.x - centerX) ** 2 + (enemy.y - centerY) ** 2
        );
        return distance <= this.range;
    }

    // Apply damage to an enemy (base attack logic)
    attack(enemy, currentTime) {
        // Check if the enemy is within range and if enough time has passed since the last attack
        if (this.isEnemyInRange(enemy) && (currentTime - this.lastAttackTime >= 1000 / this.attackSpeed)) {
            enemy.takeDamage(this.damage);
            this.lastAttackTime = currentTime; // Update last attack time
        }
    }
}

export class Enemy {
    constructor(path, health = 100) {
        this.path = path; // Reference to the path
        this.x = path[0].x; // Start at the first point of the path
        this.y = path[0].y;
        this.currentPathIndex = 0; // Track which part of the path the enemy is on
        this.speed = 2; // Speed of the enemy
        this.maxHealth = health; // Maximum health
        this.currentHealth = health; // Current health
    }

    // Update the enemy's position along the path
    update() {
        // If the enemy has reached the end of the path, stop moving
        if (this.currentPathIndex >= this.path.length - 1) return;

        // Get the next waypoint
        const target = this.path[this.currentPathIndex + 1];

        // Calculate the direction vector to the next point
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move towards the target
        if (distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            // If close to the target, snap to it and move to the next point
            this.x = target.x;
            this.y = target.y;
            this.currentPathIndex++;
        }
    }

    // Draw the enemy and its health bar
    draw(ctx) {
        // Draw the enemy as a red circle
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2); // Draw the enemy as a circle
        ctx.fill();

        // Draw the health bar
        const healthBarWidth = 100;
        const healthBarHeight = 20;
        const healthBarX = this.x - healthBarWidth / 2;
        const healthBarY = this.y - 35;

        // Background (max health)
        ctx.fillStyle = 'grey';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Foreground (current health)
        const healthPercentage = this.currentHealth / this.maxHealth;
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    }

    // Take damage (for later interactions with towers)
    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0; // Ensure health doesn’t drop below 0
        }
    }
}

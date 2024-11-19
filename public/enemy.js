export class Enemy {
    constructor(path, health = 100, speed = 2, color = 'red', reward = 10) {
        this.path = path;
        this.x = path[0].x;
        this.y = path[0].y;
        this.currentPathIndex = 0;
        this.maxHealth = health;
        this.currentHealth = health;
        this.speed = speed;
        this.size = 10;
        this.color = color;
        this.reward = reward; // Money rewarded when defeated
    }

    // Update the enemy's position along the path
    update() {
        if (this.currentPathIndex >= this.path.length - 1) return;

        const target = this.path[this.currentPathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.x = target.x;
            this.y = target.y;
            this.currentPathIndex++;
        }
    }

    // Draw the enemy and its health bar
    draw(ctx) {
        // Draw the enemy as a colored circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw the health bar
        const healthBarWidth = 60;
        const healthBarHeight = 10;
        const healthBarX = this.x - healthBarWidth / 2;
        const healthBarY = this.y - 20;

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

    // Take damage
    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
    }
}

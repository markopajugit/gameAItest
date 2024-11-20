// enemy.js

class Enemy {
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
        this.reward = reward; // Gold rewarded when defeated
        this.lastAttacker = null;
        this.rewardGiven = false; // Initialize to false
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

    // Take damage
    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
    }
}

// Export the Enemy class
module.exports = Enemy;

import { Enemy } from './enemy.js';
import { TowerManager } from './towerManager.js';
import { FastTower } from './fastTower.js';
import { SniperTower } from './sniperTower.js';
import { AreaTower } from './areaTower.js';
import { FastEnemy } from './fastEnemy.js';
import { TankEnemy } from './tankEnemy.js';
import { StealthEnemy } from './stealthEnemy.js';

// Set up the canvas
const canvas = document.createElement('canvas');
canvas.width = 1000; // Canvas width
canvas.height = 1000; // Canvas height
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Money system
let money = 100; // Starting money

// Grid settings
const tileSize = 50; // Size of each grid tile
let hoverTile = { x: null, y: null }; // Track the hovered tile
const towers = []; // Array to store Tower instances

// Initialize the TowerManager
const towerManager = new TowerManager(tileSize, towers);

// Define the path for the enemies
const path = [
    { x: 1000, y: 500 }, // Start point
    { x: 800, y: 500 }, // Move left
    { x: 800, y: 300 }, // Move up
    { x: 600, y: 300 }, // Move left
    { x: 600, y: 700 }, // Move down
    { x: 400, y: 700 }, // Move left
    { x: 400, y: 200 }, // Move up
    { x: 200, y: 200 }, // Move left
    { x: 200, y: 500 }, // Move down
    { x: 0, y: 500 }   // End point
];

// Manage enemies
const enemies = [];
let enemyCount = 0;

// Remove defeated enemies and reward money
function handleEnemyDefeat() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].currentHealth <= 0) {
            money += enemies[i].reward; // Add the reward to the player's money
            console.log(`Enemy defeated! Earned $${enemies[i].reward}. Total money: $${money}`);
            enemies.splice(i, 1); // Remove the defeated enemy
        }
    }
}

// Function to randomly spawn different types of enemies
function spawnEnemies() {
    if (enemyCount < 20) { // Limit to 20 enemies
        const randomType = Math.random();
        let newEnemy;

        if (randomType < 0.5) {
            newEnemy = new FastEnemy(path);
        } else if (randomType < 0.65) {
            newEnemy = new TankEnemy(path);
        } else {
            newEnemy = new StealthEnemy(path);
        }

        enemies.push(newEnemy);
        enemyCount++;
    }
}

// Draw the grid
function drawGrid() {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    }
}

// Highlight the hovered tile
function highlightHoveredTile() {
    if (hoverTile.x !== null && hoverTile.y !== null) {
        ctx.fillStyle = towerManager.getHoverColor(); // Get the color based on the selected tower type
        ctx.fillRect(hoverTile.x, hoverTile.y, tileSize, tileSize);
    }
}

// Display money on the screen
function displayMoney() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Money: $${money}`, 10, 30); // Top-left corner
}

// Draw towers
function drawTowers() {
    towers.forEach(tower => tower.draw(ctx)); // Call the draw method of each tower
}

// Update hoverTile based on mouse position
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the top-left corner of the tile the mouse is over
    hoverTile.x = Math.floor(mouseX / tileSize) * tileSize;
    hoverTile.y = Math.floor(mouseY / tileSize) * tileSize;
});

// Handle tile click for placing towers
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the tile coordinates
    const tileX = Math.floor(mouseX / tileSize) * tileSize;
    const tileY = Math.floor(mouseY / tileSize) * tileSize;

    // Delegate tower placement to the TowerManager
    const towerCost = towerManager.getTowerCost();
    if (money >= towerCost) {
        if (towerManager.placeTower(tileX, tileY)) {
            money -= towerCost; // Deduct the cost

        }
    } else {
        console.log(`Not enough money to place this tower! Current money: $${money}`);
    }
});

// Switch tower type based on user input (e.g., keys)
document.addEventListener('keydown', (event) => {
    if (event.key === '1') towerManager.selectTowerType('FastTower');
    if (event.key === '2') towerManager.selectTowerType('SniperTower');
    if (event.key === '3') towerManager.selectTowerType('AreaTower');
});


// Draw the path
function drawPath() {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    displayMoney(); // Display current money
    drawGrid(); // Draw the grid
    drawPath(); // Draw the path
    drawTowers(); // Draw the towers
    highlightHoveredTile(); // Highlight the hovered tile

    // Update and draw each enemy
    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw(ctx);
    });

    // Make towers attack enemies
    towers.forEach(tower => {
        if (tower instanceof AreaTower) {
            tower.attack(enemies, performance.now()); // Pass all enemies to AreaTower
        } else {
            enemies.forEach(enemy => {
                if (enemy.currentHealth > 0) {
                    tower.attack(enemy, performance.now()); // Single-target attack
                }
            });
        }
    });

    // Handle defeated enemies
    handleEnemyDefeat();

    requestAnimationFrame(gameLoop); // Repeat the game loop
}

// Start the game
function initGame() {
    drawPath(); // Draw the initial path
    setInterval(spawnEnemies, 1000); // Spawn an enemy every second
    gameLoop(); // Start the game loop
}

initGame();

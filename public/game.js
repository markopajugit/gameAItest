// public/game.js

const socket = io();

// Initialize game variables
let enemies = [];
let towers = [];
let lives = 20;
let playerGold = 100;
let path = [];
let pathCells = [];
let currentWave = 1; // Initialize with the first wave

// Listen for game state updates from the server
socket.on('game-state', (gameState) => {
    enemies = gameState.enemies;
    towers = []; // Flatten the towers object to an array
    Object.values(gameState.towers).forEach(playerTowers => {
        towers = towers.concat(playerTowers);
    });
    lives = gameState.lives;
    playerGold = gameState.gold[socket.id] || 100;
    path = gameState.path;
    currentWave = gameState.currentWave || 1; // Update current wave

    // Compute all path cells based on the path points
    pathCells = [];
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        if (start.x === end.x) { // Vertical movement
            const minY = Math.min(start.y, end.y);
            const maxY = Math.max(start.y, end.y);
            for (let y = minY; y <= maxY; y += GRID_SIZE) {
                pathCells.push({ x: start.x, y: y });
            }
        } else if (start.y === end.y) { // Horizontal movement
            const minX = Math.min(start.x, end.x);
            const maxX = Math.max(start.x, end.x);
            for (let x = minX; x <= maxX; x += GRID_SIZE) {
                pathCells.push({ x: x, y: start.y });
            }
        }
    }
});

// Listen for game over event
socket.on('game-over', () => {
    alert('Game Over!');
    // Optionally, reset local game state
});

// Listen for 'not-enough-gold' event
socket.on('not-enough-gold', () => {
    alert('Not enough gold to place a tower!');
});


// Set up the canvas
const canvas = document.createElement('canvas');
canvas.width = 1000; // Canvas width
canvas.height = 1000; // Canvas height
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Grid settings
const GRID_SIZE = 100; // Size of each grid cell in pixels

// Reference the existing reset button from the HTML
const resetButton = document.getElementById('reset-button');

// Game loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    render();
}

// Render function
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw path
    drawPath();

    // Draw enemies
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });

    // Draw towers
    towers.forEach(tower => {
        drawTower(tower);
    });

    // Draw lives and gold
    drawLives();
    drawGold();
    drawWave();
}

// Function to draw the grid
function drawGrid() {
    ctx.strokeStyle = '#ddd'; // Light gray color for grid lines
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Function to draw the current wave
function drawWave() {
    const waveText = `Wave: ${currentWave}`;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'blue';
    ctx.textAlign = 'left';
    ctx.fillText(waveText, 10, 90); // Position it below gold
}

// Function to draw the enemy path
function drawPath() {
    if (path.length < 2) return; // Need at least two points

    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
}

// Function to draw an enemy
function drawEnemy(enemy) {
    // Draw the enemy as a colored circle
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw the health bar
    const healthBarWidth = 40;
    const healthBarHeight = 5;
    const healthBarX = enemy.x - healthBarWidth / 2;
    const healthBarY = enemy.y - enemy.size - 10;

    // Background (max health)
    ctx.fillStyle = 'grey';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Foreground (current health)
    const healthPercentage = enemy.currentHealth / enemy.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

    // Border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
}

// Function to draw a tower
function drawTower(tower) {
    // Calculate the top-left corner of the grid cell
    const cellX = tower.x - GRID_SIZE / 2;
    const cellY = tower.y - GRID_SIZE / 2;

    // Fill the entire grid cell with a semi-transparent color
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'; // Green with 20% opacity
    ctx.fillRect(cellX, cellY, GRID_SIZE, GRID_SIZE);

    // Optionally draw tower range
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.stroke();
}

// Function to draw lives as a number
function drawLives() {
    const livesText = `Lives: ${lives}`;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(livesText, 10, 30); // Position it at (10, 30)
}

// Function to draw gold
function drawGold() {
    const goldText = `Gold: $${playerGold}`;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'gold';
    ctx.textAlign = 'left';
    ctx.fillText(goldText, 10, 60); // Position it below lives
}

// Handle tower placement
canvas.addEventListener('click', (event) => {
    // Get the position where the player clicked
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Snap to grid center
    const snappedX = Math.floor(x / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
    const snappedY = Math.floor(y / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

    // Check if the snapped position is on the path
    const isOnPath = pathCells.some(cell => cell.x === snappedX && cell.y === snappedY);
    if (isOnPath) {
        alert('Cannot place tower on the enemy path!');
        return;
    }

    // Optional: Check if a tower already exists at this position
    const isOccupied = towers.some(tower => tower.x === snappedX && tower.y === snappedY);
    if (isOccupied) {
        alert('A tower already exists at this location!');
        return;
    }

    // Create a tower object
    const tower = {
        x: snappedX,
        y: snappedY,
        range: 160, // Example range
        damage: 10, // Example damage
    };

    // Send tower placement to server
    socket.emit('place-tower', tower);
});

// Handle reset button click
resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
        socket.emit('reset-game');
    }
});

// Start the game loop
gameLoop();

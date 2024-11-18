const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fastEnemy = require('./features/enemies/fastEnemy');
const tankEnemy = require('./features/enemies/tankEnemy');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/game', express.static('public')); // Serve the game

// Game state
let gameState = {
    towers: {},         // { playerId: [{ x, y, range, damage }] }
    enemies: [],        // [{ id, x, y, health, type }]
    health: 20,         // Shared health
    gold: {},           // { playerId: goldAmount }
};

// Registry of enemy types
const enemyTypes = {
    fast: fastEnemy,
    tank: tankEnemy,
};

// Spawn enemies
function spawnEnemy() {
    const type = Math.random() > 0.5 ? 'fast' : 'tank';
    const enemy = enemyTypes[type].createEnemy();
    gameState.enemies.push(enemy);
    broadcastGameState();
}

// Move enemies
function moveEnemies() {
    gameState.enemies.forEach((enemy) => {
        const movement = enemy.speed;
        enemy.y += movement;
        if (enemy.y > 600) {
            gameState.health -= 1;
            enemy.health = 0; // Mark for removal
        }
    });
    gameState.enemies = gameState.enemies.filter((e) => e.health > 0);
    broadcastGameState();

    if (gameState.health <= 0) {
        io.emit('game-over', { message: 'Game Over!' });
        resetGame();
    }
}

// Broadcast game state
function broadcastGameState() {
    io.emit('game-state', gameState);
}

// Reset game
function resetGame() {
    gameState = {
        towers: {},
        enemies: [],
        health: 20,
        gold: {},
    };
}

// Player connection
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    gameState.towers[socket.id] = [];
    gameState.gold[socket.id] = 200;
    socket.emit('game-state', gameState);

    socket.on('place-tower', (tower) => {
        if (gameState.gold[socket.id] >= 50) {
            gameState.gold[socket.id] -= 50;
            gameState.towers[socket.id].push(tower);
            broadcastGameState();
        }
    });

    socket.on('disconnect', () => {
        delete gameState.towers[socket.id];
        delete gameState.gold[socket.id];
    });
});

// Start enemy spawn and movement
setInterval(spawnEnemy, 3000);
setInterval(moveEnemies, 100);

// Start server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Game server running on http://localhost:${PORT}/game`);
});

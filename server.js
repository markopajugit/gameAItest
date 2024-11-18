const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/game', express.static('public')); // Serve the game at /game

// Persistent game state
let gameState = {
    towers: {},         // { playerId: [{ x, y, range, damage }] }
    enemies: [],        // [{ id, x, y, health }]
    health: 20,         // Shared health
    gold: {},           // { playerId: goldAmount }
};

// Enemy spawn logic
function spawnEnemy() {
    const id = Date.now();
    const newEnemy = [
        { id, x: 50, y: 50, health: 100, path: 'lane1' }, // Lane 1
        { id: id + 1, x: 750, y: 50, health: 100, path: 'lane2' }, // Lane 2
    ];
    gameState.enemies.push(...newEnemy);
    broadcastGameState();
}

// Enemy movement logic
function moveEnemies() {
    gameState.enemies.forEach((enemy) => {
        if (enemy.path === 'lane1') {
            enemy.y += 2; // Move downwards
            if (enemy.y >= 300) enemy.path = 'merge'; // Merge at midpoint
        } else if (enemy.path === 'lane2') {
            enemy.y += 2; // Move downwards
            if (enemy.y >= 300) enemy.path = 'merge'; // Merge at midpoint
        } else if (enemy.path === 'merge') {
            enemy.x += enemy.x < 400 ? 1 : -1; // Move toward center
            enemy.y += 2; // Continue downwards
        }
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

// Broadcast game state to all players
function broadcastGameState() {
    io.emit('game-state', gameState);
}

// Reset game state
function resetGame() {
    gameState = {
        towers: {},
        enemies: [],
        health: 20,
        gold: {},
    };
}

// Set up server-side events
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Initialize player-specific data
    gameState.towers[socket.id] = [];
    gameState.gold[socket.id] = 200;

    // Send initial game state
    socket.emit('game-state', gameState);

    // Handle tower placement
    socket.on('place-tower', (tower) => {
        if (gameState.gold[socket.id] >= 50) {
            gameState.gold[socket.id] -= 50;
            gameState.towers[socket.id].push(tower);
            broadcastGameState();
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
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

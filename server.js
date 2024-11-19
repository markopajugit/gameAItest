const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

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
    }
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


// Start server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Game server running on http://localhost:${PORT}/game`);
});

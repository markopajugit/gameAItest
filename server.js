// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const Enemy = require('./enemy');
const FastEnemy = require('./fastEnemy');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/game', express.static('public')); // Serve the game

// Define the path that enemies will follow
const path = [
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 800 },
    { x: 500, y: 800 },
    { x: 500, y: 200 },
    { x: 700, y: 200 },
    { x: 700, y: 500 },
    { x: 1000, y: 500 }, // Assuming canvas width is increased accordingly
    // Add more points as needed
];

const TOWER_COSTS = {
    splash: 100,
    speed: 150,
    sniper: 200,
};

// Game state
let gameState = {
    towers: {},         // { playerId: [{ x, y, range, damage }] }
    enemies: [],        // Array of enemy instances
    lives: 20,          // Shared lives
    path: path,         // Enemy path
    gold: {},           // { playerId: gold }
    currentWave: 0,     // Track the current wave number
};

let waveInterval = null;

// Broadcast game state to all clients
function broadcastGameState() {
    // Extract necessary data from enemies
    const enemiesData = gameState.enemies.map(enemy => {
        return {
            id: enemy.id,
            x: enemy.x,
            y: enemy.y,
            currentHealth: enemy.currentHealth,
            maxHealth: enemy.maxHealth,
            color: enemy.color,
            size: enemy.size,
        };
    });

    // Extract towers data
    const towersData = {};
    for (const playerId in gameState.towers) {
        towersData[playerId] = gameState.towers[playerId].map(tower => ({
            x: tower.x,
            y: tower.y,
            type: tower.type,
            range: tower.range,
            damage: tower.damage,
            attackSpeed: tower.attackSpeed,
            lastAttackTime: tower.lastAttackTime,
        }));
    }

    // Extract gold data
    const goldData = { ...gameState.gold };

    io.emit('game-state', {
        enemies: enemiesData,
        towers: towersData,
        lives: gameState.lives,
        path: gameState.path,
        gold: goldData,
        currentWave: gameState.currentWave,
    });
}

// Modify the `resetGame` function to reset wave tracking
function resetGame() {
    gameState.towers = {};
    gameState.enemies = [];
    gameState.lives = 20;
    gameState.path = path;
    gameState.currentWave = 0; // Reset wave number

    // Reset gold for all connected players to 200
    for (const playerId in gameState.gold) {
        gameState.gold[playerId] = 200;
    }

    console.log('Game has been reset.');

    // Optionally, restart enemy waves after reset
    startEnemyWaves();
}

// Player connection
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Initialize player's gold
    gameState.gold[socket.id] = 100; // Starting gold

    socket.emit('game-state', gameState);

    // Inside the 'place-tower' event listener
    socket.on('place-tower', (tower) => {
        const TOWER_COST = TOWER_COSTS[tower.type] || 50; // Default to 50 if type not found

        // Check if the player has enough gold
        if (gameState.gold[socket.id] < TOWER_COST) {
            // Emit an event to notify the client
            socket.emit('not-enough-gold');
            console.log(`Player ${socket.id} does not have enough gold to place a ${tower.type} tower.`);
            return;
        }

        // Deduct the tower cost
        gameState.gold[socket.id] -= TOWER_COST;
        console.log(`Player ${socket.id} placed a ${tower.type} tower. Remaining gold: ${gameState.gold[socket.id]}`);

        // Handle tower placement
        if (!gameState.towers[socket.id]) {
            gameState.towers[socket.id] = [];
        }

        // Initialize lastAttackTime for the tower
        tower.lastAttackTime = Date.now();

        gameState.towers[socket.id].push(tower);
        broadcastGameState();
    });

    // Listen for 'reset-game' event from any client
    socket.on('reset-game', () => {
        console.log(`Reset requested by player: ${socket.id}`);
        resetGame();
        broadcastGameState();
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Remove player's towers and gold
        delete gameState.towers[socket.id];
        delete gameState.gold[socket.id];
    });
});

// Generate unique ID for each enemy
let enemyIdCounter = 0;
function generateUniqueId() {
    return enemyIdCounter++;
}

// Function to spawn a wave of enemies
function spawnWave(waveNumber) {
    const enemiesToSpawn = 10 + 5 * (waveNumber - 1);
    console.log(`Spawning Wave ${waveNumber} with ${enemiesToSpawn} enemies.`);

    let spawnedEnemies = 0;
    const spawnInterval = setInterval(() => {
        if (spawnedEnemies >= enemiesToSpawn) {
            clearInterval(spawnInterval);
            return;
        }
        const enemy = new FastEnemy(path);
        enemy.id = generateUniqueId();
        gameState.enemies.push(enemy);
        spawnedEnemies++;
    }, 500); // Spawn an enemy every 500ms
}

// Function to start managing enemy waves
function startEnemyWaves() {
    // Clear any existing interval to prevent multiple intervals
    if (waveInterval) {
        clearInterval(waveInterval);
    }

    // Reset currentWave to 1
    gameState.currentWave = 1;
    spawnWave(gameState.currentWave);

    // Schedule subsequent waves every 10 seconds (aligning with comment)
    waveInterval = setInterval(() => {
        gameState.currentWave += 1;
        spawnWave(gameState.currentWave);
    }, 20000); // 20000 milliseconds = 20 seconds
}

// Game loop to update enemies and broadcast game state
function gameLoop() {
    setInterval(() => {
        const now = Date.now();

        // Update enemies
        gameState.enemies.forEach(enemy => {
            enemy.update();
        });

        // Towers attack enemies
        Object.entries(gameState.towers).forEach(([playerId, playerTowers]) => {
            playerTowers.forEach(tower => {
                // Check if tower can attack
                if (now - tower.lastAttackTime >= 1000 / tower.attackSpeed) {
                    // Tower can attack
                    if (tower.type === 'splash') {
                        // Splash Tower: Attack all enemies within range
                        let enemiesInRange = gameState.enemies.filter(enemy => {
                            const dx = tower.x - enemy.x;
                            const dy = tower.y - enemy.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            return distance <= tower.range;
                        });

                        if (enemiesInRange.length > 0) {
                            enemiesInRange.forEach(enemy => {
                                enemy.takeDamage(tower.damage);
                                enemy.lastAttacker = playerId; // Record the last attacker
                            });
                            tower.lastAttackTime = now; // Update last attack time only after attacking
                        }
                    } else if (tower.type === 'speed') {
                        // Speed Tower: Attack the first enemy within range
                        let targetEnemy = gameState.enemies.find(enemy => {
                            const dx = tower.x - enemy.x;
                            const dy = tower.y - enemy.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            return distance <= tower.range;
                        });

                        if (targetEnemy) {
                            targetEnemy.takeDamage(tower.damage);
                            targetEnemy.lastAttacker = playerId; // Record the last attacker
                            tower.lastAttackTime = now; // Update last attack time
                        }
                    } else if (tower.type === 'sniper') {
                        // Sniper Tower: Attack the first enemy within extended range
                        let targetEnemy = gameState.enemies.find(enemy => {
                            const dx = tower.x - enemy.x;
                            const dy = tower.y - enemy.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            return distance <= tower.range;
                        });

                        if (targetEnemy) {
                            targetEnemy.takeDamage(tower.damage);
                            targetEnemy.lastAttacker = playerId; // Record the last attacker
                            tower.lastAttackTime = now; // Update last attack time
                        }
                    }
                }
            });
        });

        // Handle enemies reaching the end
        gameState.enemies.forEach(enemy => {
            if (enemy.currentPathIndex >= enemy.path.length - 1) {
                // Enemy has reached the end
                gameState.lives -= 1; // Decrease lives
                enemy.currentHealth = 0; // Mark enemy as dead
                enemy.rewardGiven = true; // Prevent rewarding gold
            }
        });

        // Reward players for defeated enemies
        gameState.enemies.forEach(enemy => {
            if (enemy.currentHealth <= 0 && enemy.rewardGiven !== true && enemy.lastAttacker) {
                const attackerId = enemy.lastAttacker;
                if (attackerId && gameState.gold[attackerId] !== undefined) {
                    gameState.gold[attackerId] += enemy.reward;
                    console.log(`Player ${attackerId} earned ${enemy.reward} gold from defeating an enemy.`);
                }
                enemy.rewardGiven = true; // Prevent multiple rewards
            }
        });

        // Remove dead enemies
        gameState.enemies = gameState.enemies.filter(enemy => enemy.currentHealth > 0);

        // Broadcast game state
        broadcastGameState();

        // Check for game over
        if (gameState.lives <= 0) {
            // Game over logic
            resetGame();
            io.emit('game-over');
        }

    }, 1000 / 60); // 60 times per second
}

// Start the game
startEnemyWaves();
gameLoop();

// Start server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Game server running on http://localhost:${PORT}/game`);
});

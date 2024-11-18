const socket = io();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a plane for the map
const geometry = new THREE.PlaneGeometry(800, 600);
const material = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
const map = new THREE.Mesh(geometry, material);
map.rotation.x = -Math.PI / 2; // Rotate to lie flat
scene.add(map);

// Create enemies
const enemyGeometry = new THREE.BoxGeometry(5, 5, 5);
const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const enemies = [];

// Create towers
const towerGeometry = new THREE.CylinderGeometry(5, 5, 10);
const towerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const towers = [];

// Lighting
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

// Camera position
camera.position.set(0, 200, 300);
camera.lookAt(0, 0, 0);

// Game state
let gameState = { towers: {}, enemies: [], health: 20, gold: 200 };

// Listen for game state updates
socket.on('game-state', (state) => {
    gameState = state;
    drawGame();
});

// Listen for game over
socket.on('game-over', (data) => {
    alert(data.message);
    location.reload();
});

// Add towers on click
document.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([map]);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        socket.emit('place-tower', { x: point.x, y: 10, z: point.z, range: 50, damage: 10 });
    }
});

// Update game objects
function updateGameObjects() {
    // Clear scene except map
    scene.children = scene.children.filter((obj) => obj === map || obj === light);

    // Draw towers
    Object.values(gameState.towers).forEach((playerTowers) => {
        playerTowers.forEach((tower) => {
            const towerMesh = new THREE.Mesh(towerGeometry, towerMaterial);
            towerMesh.position.set(tower.x, tower.y, tower.z);
            scene.add(towerMesh);
        });
    });

    // Draw enemies
    gameState.enemies.forEach((enemy) => {
        const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemyMesh.position.set(enemy.x, 5, enemy.y);
        scene.add(enemyMesh);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

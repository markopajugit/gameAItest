const socket = io();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(800, 600);
const material = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
const map = new THREE.Mesh(geometry, material);
map.rotation.x = -Math.PI / 2; // Rotate to lie flat
scene.add(map);

// Enemy registry
const enemyMaterials = {
    fast: new THREE.MeshBasicMaterial({ color: 0x0000ff }),    // Blue
    tank: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),    // Green
};

const enemyGeometry = new THREE.BoxGeometry(5, 5, 5);
const towerGeometry = new THREE.CylinderGeometry(5, 5, 10);
const towerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
camera.position.set(0, 200, 300);
camera.lookAt(0, 0, 0);

let gameState = { towers: {}, enemies: [], health: 20, gold: 200 };

socket.on('game-state', (state) => {
    gameState = state;
    updateGameObjects();
});

socket.on('game-over', (data) => {
    alert(data.message);
    location.reload();
});

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

function updateGameObjects() {
    scene.children = scene.children.filter((obj) => obj === map || obj === light);

    Object.values(gameState.towers).forEach((playerTowers) => {
        playerTowers.forEach((tower) => {
            const towerMesh = new THREE.Mesh(towerGeometry, towerMaterial);
            towerMesh.position.set(tower.x, tower.y, tower.z);
            scene.add(towerMesh);
        });
    });

    gameState.enemies.forEach((enemy) => {
        const material = enemyMaterials[enemy.type] || new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const enemyMesh = new THREE.Mesh(enemyGeometry, material);
        enemyMesh.position.set(enemy.x, 5, enemy.y);
        scene.add(enemyMesh);
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

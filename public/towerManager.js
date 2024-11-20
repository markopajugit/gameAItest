import { FastTower } from './fastTower.js';
import { SniperTower } from './sniperTower.js';
import { AreaTower } from './areaTower.js';

const socket = io(); // Connect to the server

export class TowerManager {
    constructor(tileSize, towers) {
        this.tileSize = tileSize; // Size of each grid tile
        this.towers = towers; // Array to store towers
        this.selectedTowerType = 'FastTower'; // Default tower type
    }

    getTower(towerId){
        return this.towers[towerId];
    }

    // Set the selected tower type
    selectTowerType(type) {
        this.selectedTowerType = type;
        console.log(`Selected Tower: ${this.selectedTowerType}`);
    }

    // Get the hover color based on the selected tower type
    getHoverColor() {
        switch (this.selectedTowerType) {
            case 'FastTower':
                return 'blue';
            case 'SniperTower':
                return 'purple';
            case 'AreaTower':
                return 'orange';
            default:
                return 'red';
        }
    }

    // Get the cost of the selected tower type
    getTowerCost() {
        switch (this.selectedTowerType) {
            case 'FastTower':
                return 50;
            case 'SniperTower':
                return 40;
            case 'AreaTower':
                return 30;
            default:
                return 0;
        }
    }

    // Place a tower on the specified tile
    placeTower(playerId, tileX, tileY) {
        // Check if there's already a tower on this tile
        if (this.towers.some(tower => tower.x === tileX && tower.y === tileY)) {
            console.log(`Tile (${tileX / this.tileSize}, ${tileY / this.tileSize}) already has a tower!`);
            return false;
        }

        let newTower;

        // Create the appropriate tower type
        if (this.selectedTowerType === 'FastTower') {
            newTower = new FastTower(playerId, tileX, tileY, this.tileSize);
        } else if (this.selectedTowerType === 'SniperTower') {
            newTower = new SniperTower(playerId, tileX, tileY, this.tileSize);
        } else if (this.selectedTowerType === 'AreaTower') {
            newTower = new AreaTower(playerId, tileX, tileY, this.tileSize);
        }

        // Add the new tower to the list
        this.towers.push(newTower);
        socket.emit('place-tower', newTower);
        return true; // Indicate that the placement was successful
    }
}

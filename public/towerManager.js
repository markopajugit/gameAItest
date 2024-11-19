import { FastTower } from './fastTower.js';
import { SniperTower } from './sniperTower.js';
import { AreaTower } from './areaTower.js';

export class TowerManager {
    constructor(tileSize, towers) {
        this.tileSize = tileSize; // Size of each grid tile
        this.towers = towers; // Array to store towers
        this.selectedTowerType = 'FastTower'; // Default tower type
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

    // Place a tower on the specified tile
    placeTower(tileX, tileY) {
        if (this.towers.some(tower => tower.x === tileX && tower.y === tileY)) {
            console.log(`Tile (${tileX / this.tileSize}, ${tileY / this.tileSize}) already has a tower!`);
            return;
        }

        let newTower;
        if (this.selectedTowerType === 'FastTower') {
            newTower = new FastTower(tileX, tileY, this.tileSize);
        } else if (this.selectedTowerType === 'SniperTower') {
            newTower = new SniperTower(tileX, tileY, this.tileSize);
        } else if (this.selectedTowerType === 'AreaTower') {
            newTower = new AreaTower(tileX, tileY, this.tileSize);
        }

        this.towers.push(newTower);
        console.log(`Placed a ${this.selectedTowerType} at (${tileX / this.tileSize}, ${tileY / this.tileSize})`);
    }
}

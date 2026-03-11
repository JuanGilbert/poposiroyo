import Phaser from 'phaser';
import { Board } from '../objects/Board.js';
import { Unit } from '../objects/Unit.js';
import { BattleUI } from '../objects/BattleUI.js';
import { PlacementManager } from '../objects/PlacementManager.js';
import { CombatManager } from '../objects/CombatManager.js'; // <-- 1. Import it

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isLookingAtEnemy = false;
        this.isCameraPanning = false;
    }

    init(data) {
        this.playerTeamChoices = data.playerTeam || ['Assassin', 'Mage', 'Paladin'];
        this.registry.set('roomId', data.roomId);
        this.isPlayer1 = data.isPlayer1; // <-- ADD THIS LINE to save the player role!
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.cameras.main.setBounds(0, 0, screenWidth * 2, screenHeight);

        const maxGridWidth = screenWidth - 40;
        const maxGridHeight = screenHeight - 220;
        const cellSize = Math.floor(Math.min(maxGridWidth / 10, maxGridHeight / 10));
        const gridStartX = (screenWidth - (cellSize * 10)) / 2;
        const gridStartY = 100;

        // 1. BOARDS
        this.playerBoard = new Board(this, gridStartX, gridStartY, cellSize, false);
        this.enemyBoard = new Board(this, gridStartX + screenWidth, gridStartY, cellSize, true);

        // 2. MANAGERS (All the messy logic is perfectly isolated now!)
        this.ui = new BattleUI(this);
        this.placementManager = new PlacementManager(this);
        this.combatManager = new CombatManager(this); // <-- 2. Initialize it

        this.events.on('ui_action_selected', (action) => {
            this.playerActionState = action;
        });

        // 3. SPAWN UNITS
        this.activeUnits = [];
        this.spawnPlayerTeam();

        this.events.on('cellClicked', (clickedCell) => {
            this.handleCellClicked(clickedCell);
        });

        // 4. KICKOFF
        this.placementManager.start();
    }

    // --- SETUP & SPAWNERS ---
    spawnPlayerTeam() {
        const gameConfig = this.registry.get('gameConfig');
        const CHARACTER_DATA = gameConfig.characters;

        let currentRow = 1;
        this.playerTeamChoices.forEach((charName) => {
            const blueprint = CHARACTER_DATA[charName];
            const newUnit = new Unit(blueprint, true);

            const footprint = [];
            for (let i = 0; i < blueprint.tileSize; i++) {
                footprint.push({ row: currentRow + i, col: 1 });
            }

            this.playerBoard.spawnUnit(newUnit, footprint);
            this.activeUnits.push(newUnit);
            currentRow += blueprint.tileSize + 1;
        });
    }

    spawnEnemyTeam(enemyUnitsData) {
        const gameConfig = this.registry.get('gameConfig');
        const CHARACTER_DATA = gameConfig.characters;

        enemyUnitsData.forEach(data => {
            const blueprint = CHARACTER_DATA[data.name];
            const enemyUnit = new Unit(blueprint, false); // isPlayerUnit = false

            // Spawn them EXACTLY where the opponent placed them
            this.enemyBoard.spawnUnit(enemyUnit, data.coordinates);
            this.activeUnits.push(enemyUnit);
        });
    }

    // --- MASTER CLICK ROUTER ---
    handleCellClicked(cell) {
        if (this.gameState === 'PLACEMENT') {
            this.placementManager.handleClick(cell);
        } else if (this.gameState === 'PLAYER_TURN') {
            this.combatManager.handleClick(cell); // <-- 3. Route to the new manager!
        }
    }

    // Helper to highlight units during placement
    highlightUnit(unit, color) {
        unit.coordinates.forEach(coord => {
            this.playerBoard.grid[coord.row][coord.col].baseSquare.setStrokeStyle(3, color);
        });
    }

    clearHighlights() {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                this.playerBoard.grid[r][c].baseSquare.setStrokeStyle(1, 0x000000);
            }
        }
    }
}
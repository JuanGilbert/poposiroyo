import Phaser from 'phaser';
import { Board } from '../objects/Board.js';
import { Unit } from '../objects/Unit.js';


export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isLookingAtEnemy = false;
        this.isCameraPanning = false;
    }

    init(data) {
        this.playerTeamChoices = data.playerTeam || ['Assassin', 'Mage', 'Paladin'];
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.cameras.main.setBounds(0, 0, screenWidth * 2, screenHeight);

        // FIX 3: Calculate a cellSize and force it to a whole number to prevent sub-pixel gaps
        const maxGridWidth = screenWidth - 40;
        const maxGridHeight = screenHeight - 220;
        const cellSize = Math.floor(Math.min(maxGridWidth / 10, maxGridHeight / 10)); // Added Math.floor!

        // FIX 4: Center the grid perfectly
        const gridStartX = (screenWidth - (cellSize * 10)) / 2;
        const gridStartY = 100;

        // 1. CREATE BOARDS
        this.playerBoard = new Board(this, gridStartX, gridStartY, cellSize, false);
        this.enemyBoard = new Board(this, gridStartX + screenWidth, gridStartY, cellSize, true);

        // 2. UI CONTAINERS
        this.turnTrackerContainer = this.add.container(screenWidth / 2, 60).setScrollFactor(0).setDepth(100);
        this.createToggleButton(screenWidth, screenHeight);
        this.createActionMenu(screenWidth, screenHeight); // New Battle Menu!

        // 3. SPAWN UNITS
        this.activeUnits = [];
        this.turnQueue = [];
        this.spawnPlayerTeam();
        this.spawnEnemyDummy();

        this.events.on('cellClicked', (clickedCell) => {
            this.handleCellClicked(clickedCell);
        });

        // 4. START PLACEMENT PHASE
        this.startPlacementPhase(screenWidth, screenHeight);
    }

    // --- SETUP & SPAWNERS ---
    spawnPlayerTeam() {
        // 1. Get the CMS data from the registry
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

    spawnEnemyDummy() {
        // 1. Get the CMS data from the registry
        const gameConfig = this.registry.get('gameConfig');
        const CHARACTER_DATA = gameConfig.characters;

        const pBlueprint = CHARACTER_DATA['Paladin'];
        const enemy1 = new Unit(pBlueprint, false);
        this.enemyBoard.spawnUnit(enemy1, [{row: 2, col: 5}, {row: 3, col: 5}, {row: 4, col: 5}]);
        this.activeUnits.push(enemy1);

        const aBlueprint = CHARACTER_DATA['Assassin'];
        const enemy2 = new Unit(aBlueprint, false);
        this.enemyBoard.spawnUnit(enemy2, [{row: 7, col: 6}]);
        this.activeUnits.push(enemy2);
    }

    // --- PLACEMENT PHASE LOGIC ---
    startPlacementPhase(screenWidth, screenHeight) {
        this.gameState = 'PLACEMENT';
        this.selectedUnit = null;
        this.placementTime = 30;

        // UI: Timer Text
        this.placementTimerText = this.add.text(screenWidth / 2, 50, "SETUP PHASE: 30", {
            fontSize: '22px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        // UI: Ready Button
        const readyBg = this.add.rectangle(screenWidth / 2, 100, 150, 40, 0x4caf50).setOrigin(0.5).setInteractive();
        const readyTxt = this.add.text(screenWidth / 2, 100, "READY", { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.readyContainer = this.add.container(0, 0, [readyBg, readyTxt]).setScrollFactor(0);

        readyBg.on('pointerdown', () => this.endPlacementPhase());

        // Timer Logic
        this.placementTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.placementTime--;
                this.placementTimerText.setText(`SETUP PHASE: ${this.placementTime}`);
                if (this.placementTime <= 0) this.endPlacementPhase();
            },
            callbackScope: this,
            loop: true
        });
    }

    endPlacementPhase() {
        if (this.gameState !== 'PLACEMENT') return;
        this.placementTimer.remove();
        this.placementTimerText.destroy();
        this.readyContainer.destroy();
        this.clearHighlights();

        this.generalTurnCount = 0; // Reset turn counter
        this.startNextTurn(); // Kick off the actual battle!
    }

    // --- MASTER CLICK ROUTER ---
    handleCellClicked(cell) {
        if (this.gameState === 'PLACEMENT') {
            this.handlePlacementClick(cell);
        } else if (this.gameState === 'PLAYER_TURN') {
            this.handleBattleClick(cell);
        }
    }

    // --- PLACEMENT CLICK LOGIC ---
    handlePlacementClick(cell) {
        if (cell.isEnemyBoard) return; // Can't touch enemy board yet

        if (cell.hasUnit) {
            // Select the clicked unit
            this.clearHighlights();
            this.selectedUnit = cell.unitRef;
            this.highlightUnit(this.selectedUnit, 0xffff00); // Highlight Yellow
        } else if (this.selectedUnit) {
            // Try to move the selected unit to the empty square
            const newCoords = [];
            for (let i = 0; i < this.selectedUnit.tileSize; i++) {
                newCoords.push({ row: cell.row + i, col: cell.col }); // Vertical placement
            }

            if (this.playerBoard.isAreaAvailable(newCoords, this.selectedUnit)) {
                this.playerBoard.moveUnit(this.selectedUnit, newCoords);
                this.clearHighlights();
                this.selectedUnit = null;
            }
        }
    }

    // --- BATTLE CLICK LOGIC ---
    handleBattleClick(cell) {
        if (this.playerActionState === 'ATTACKING') {
            if (!cell.isEnemyBoard) return; // Must attack enemy

            const unit = this.currentUnit;
            const hideFogTurn = this.generalTurnCount + 4;

            // Reveal Fog
            unit.revealOffsets.forEach(offset => {
                const r = cell.row + offset.r;
                const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const revCell = this.enemyBoard.grid[r][c];
                    revCell.revealFog();
                    revCell.fogReturnTurn = hideFogTurn;
                }
            });

            // Apply Damage
            unit.attackOffsets.forEach(offset => {
                const r = cell.row + offset.r;
                const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const hitCell = this.enemyBoard.grid[r][c];
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            this.setActionMenuVisible(false);
            this.startNextTurn();

        } else if (this.playerActionState === 'MOVING') {
            if (cell.isEnemyBoard) return; // Must move on own board

            const startCoord = this.currentUnit.coordinates[0];
            const dist = Math.abs(cell.row - startCoord.row) + Math.abs(cell.col - startCoord.col);

            if (dist > this.currentUnit.moveRange) {
                console.log("Too far to move!");
                return; // Optionally add a UI message here later!
            }

            const newCoords = [];
            for (let i = 0; i < this.currentUnit.tileSize; i++) {
                newCoords.push({ row: cell.row + i, col: cell.col });
            }

            if (this.playerBoard.isAreaAvailable(newCoords, this.currentUnit)) {
                this.playerBoard.moveUnit(this.currentUnit, newCoords);
                this.setActionMenuVisible(false);
                this.startNextTurn();
            }
        }
    }

    // --- COMBAT QUEUE LOGIC ---
    buildTurnQueue() {
        this.turnQueue = [...this.activeUnits].filter(unit => !unit.isDead);
        this.turnQueue.sort((a, b) => b.speed - a.speed);
    }

    startNextTurn() {
        if (this.turnQueue.length === 0) this.buildTurnQueue();

        this.generalTurnCount++;

        // Restore Fog
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                let cell = this.enemyBoard.grid[r][c];
                if (!cell.isFogged && cell.fogReturnTurn > 0 && this.generalTurnCount >= cell.fogReturnTurn) {
                    cell.restoreFog();
                }
            }
        }

        this.currentUnit = this.turnQueue.shift();
        this.currentUnit.takePersonalTurn();
        this.updateTurnTrackerUI();

        if (this.currentUnit.isPlayerUnit) {
            this.gameState = 'PLAYER_TURN';
            // Show the Action Menu and clear previous selection
            this.playerActionState = null;
            this.moveBtnBg.setStrokeStyle(0);
            this.atkBtnBg.setStrokeStyle(0);
            this.setActionMenuVisible(true);
        } else {
            this.gameState = 'ENEMY_TURN';
            this.setActionMenuVisible(false);
            this.time.delayedCall(1200, () => this.fakeEnemyTurn());
        }
    }

    fakeEnemyTurn() {
        const randomRow = Phaser.Math.Between(0, 9);
        const randomCol = Phaser.Math.Between(0, 9);
        const targetCell = this.playerBoard.grid[randomRow][randomCol];

        if (targetCell.isHit) {
            this.fakeEnemyTurn();
            return;
        }

        targetCell.isHit = true;
        targetCell.baseSquare.setFillStyle(0xff9900);
        this.cameras.main.pan(this.scale.width / 2, this.scale.height / 2, 600, 'Power2');
        this.isLookingAtEnemy = false;
        this.startNextTurn();
    }

    // --- UI DRAWING METHODS ---
    createActionMenu(screenWidth, screenHeight) {
        // Calculate the absolute center-bottom position
        const centerX = screenWidth / 2;
        const baseY = screenHeight - 45;

        // Apply setScrollFactor(0) and setDepth() directly to EVERY element
        const bg = this.add.rectangle(centerX, baseY, 260, 80, 0x222222)
            .setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(100);

        // MOVE BUTTON
        this.moveBtnBg = this.add.rectangle(centerX - 65, baseY, 100, 50, 0x2196f3)
            .setInteractive().setScrollFactor(0).setDepth(101);
        const moveTxt = this.add.text(centerX - 65, baseY, "MOVE", { fontSize: '18px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // ATTACK BUTTON
        this.atkBtnBg = this.add.rectangle(centerX + 65, baseY, 100, 50, 0xf44336)
            .setInteractive().setScrollFactor(0).setDepth(101);
        const atkTxt = this.add.text(centerX + 65, baseY, "ATTACK", { fontSize: '18px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // Group them in a simple array instead of a Phaser Container
        this.actionMenuElements = [bg, this.moveBtnBg, moveTxt, this.atkBtnBg, atkTxt];
        this.setActionMenuVisible(false);

        this.moveBtnBg.on('pointerdown', () => {
            this.playerActionState = 'MOVING';
            this.moveBtnBg.setStrokeStyle(3, 0xffff00); // Highlight yellow
            this.atkBtnBg.setStrokeStyle(0);
        });

        this.atkBtnBg.on('pointerdown', () => {
            this.playerActionState = 'ATTACKING';
            this.atkBtnBg.setStrokeStyle(3, 0xffff00); // Highlight yellow
            this.moveBtnBg.setStrokeStyle(0);
        });
    }

    // New Helper Method to toggle the array!
    setActionMenuVisible(isVisible) {
        this.actionMenuElements.forEach(el => el.setVisible(isVisible));
    }

    updateTurnTrackerUI() {
        this.turnTrackerContainer.removeAll(true);
        const displayList = [];
        if (this.currentUnit) displayList.push(this.currentUnit);
        displayList.push(...this.turnQueue);

        const nextRoundOrder = [...this.activeUnits].filter(unit => !unit.isDead);
        nextRoundOrder.sort((a, b) => b.speed - a.speed);

        while (displayList.length < 5 && nextRoundOrder.length > 0) {
            displayList.push(...nextRoundOrder);
        }

        const showCount = Math.min(displayList.length, 5);
        const boxSize = 50;
        const spacing = 15;
        let startX = -(((showCount * boxSize) + ((showCount - 1) * spacing)) / 2) + (boxSize / 2);

        for (let i = 0; i < showCount; i++) {
            const unit = displayList[i];
            const isCurrentTurn = (i === 0);
            const bgColor = unit.isPlayerUnit ? 0x2196f3 : 0xff9900;

            const box = this.add.rectangle(startX, 0, boxSize, boxSize, bgColor);
            box.setStrokeStyle(isCurrentTurn ? 4 : 2, isCurrentTurn ? 0xffffff : 0x000000);
            const iconText = this.add.text(startX, 0, unit.name.substring(0, 3).toUpperCase(), { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            if (isCurrentTurn) {
                box.setScale(1.2);
                iconText.setScale(1.2);
            }
            this.turnTrackerContainer.add([box, iconText]);
            startX += boxSize + spacing;
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

    createToggleButton(screenWidth, screenHeight) {
        const xPos = screenWidth - 60;
        const yPos = screenHeight - 60;
        const btnBg = this.add.circle(xPos, yPos, 35, 0xffd700).setOrigin(0.5).setScrollFactor(0);
        const btnIcon = this.add.text(xPos, yPos, "🔄", { fontSize: '30px' }).setOrigin(0.5).setScrollFactor(0);

        btnBg.setInteractive(new Phaser.Geom.Circle(35, 35, 35), Phaser.Geom.Circle.Contains);
        btnBg.on('pointerdown', () => { if (!this.isCameraPanning) { btnBg.setScale(0.9); btnIcon.setScale(0.9); }});
        btnBg.on('pointerup', () => {
            btnBg.setScale(1); btnIcon.setScale(1);
            if (this.isCameraPanning) return;
            this.isCameraPanning = true;
            this.cameras.main.pan(this.isLookingAtEnemy ? screenWidth / 2 : screenWidth * 1.5, screenHeight / 2, 600, 'Power2');
            this.isLookingAtEnemy = !this.isLookingAtEnemy;
            this.time.delayedCall(600, () => { this.isCameraPanning = false; });
        });
    }
}
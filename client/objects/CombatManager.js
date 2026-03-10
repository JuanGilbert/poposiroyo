import Phaser from 'phaser';

export class CombatManager {
    constructor(scene) {
        this.scene = scene; // Keep a reference to the main GameScene
        this.turnQueue = [];
        this.generalTurnCount = 0;
        this.currentUnit = null;
    }

    start() {
        this.generalTurnCount = 0;
        this.startNextTurn();
    }

    // --- BATTLE CLICK LOGIC ---
    handleClick(cell) {
        if (this.scene.playerActionState === 'ATTACKING') {
            if (!cell.isEnemyBoard) return;

            const unit = this.currentUnit;
            const hideFogTurn = this.generalTurnCount + 4;

            unit.revealOffsets.forEach(offset => {
                const r = cell.row + offset.r;
                const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const revCell = this.scene.enemyBoard.grid[r][c];
                    revCell.revealFog();
                    revCell.fogReturnTurn = hideFogTurn;
                }
            });

            unit.attackOffsets.forEach(offset => {
                const r = cell.row + offset.r;
                const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const hitCell = this.scene.enemyBoard.grid[r][c];
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            this.scene.ui.setActionMenuVisible(false);
            this.startNextTurn();

        } else if (this.scene.playerActionState === 'MOVING') {
            if (cell.isEnemyBoard) return;

            const startCoord = this.currentUnit.coordinates[0];
            const dist = Math.abs(cell.row - startCoord.row) + Math.abs(cell.col - startCoord.col);

            if (dist > this.currentUnit.moveRange) {
                console.log("Too far to move!");
                return;
            }

            const newCoords = [];
            for (let i = 0; i < this.currentUnit.tileSize; i++) {
                newCoords.push({ row: cell.row + i, col: cell.col });
            }

            if (this.scene.playerBoard.isAreaAvailable(newCoords, this.currentUnit)) {
                this.scene.playerBoard.moveUnit(this.currentUnit, newCoords);
                this.scene.ui.setActionMenuVisible(false);
                this.startNextTurn();
            }
        }
    }

    // --- COMBAT QUEUE LOGIC ---
    buildTurnQueue() {
        this.turnQueue = [...this.scene.activeUnits].filter(unit => !unit.isDead);
        this.turnQueue.sort((a, b) => b.speed - a.speed);
    }

    startNextTurn() {
        if (this.turnQueue.length === 0) this.buildTurnQueue();

        this.generalTurnCount++;

        // Restore Fog
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                let cell = this.scene.enemyBoard.grid[r][c];
                if (!cell.isFogged && cell.fogReturnTurn > 0 && this.generalTurnCount >= cell.fogReturnTurn) {
                    cell.restoreFog();
                }
            }
        }

        this.currentUnit = this.turnQueue.shift();
        this.currentUnit.takePersonalTurn();

        this.scene.ui.updateTurnTrackerUI(this.currentUnit, this.turnQueue, this.scene.activeUnits);

        if (this.currentUnit.isPlayerUnit) {
            this.scene.gameState = 'PLAYER_TURN';
            this.scene.playerActionState = null;
            this.scene.ui.setActionMenuVisible(true);
        } else {
            this.scene.gameState = 'ENEMY_TURN';
            this.scene.ui.setActionMenuVisible(false);
            this.scene.time.delayedCall(1200, () => this.fakeEnemyTurn());
        }
    }

    fakeEnemyTurn() {
        const randomRow = Phaser.Math.Between(0, 9);
        const randomCol = Phaser.Math.Between(0, 9);
        const targetCell = this.scene.playerBoard.grid[randomRow][randomCol];

        if (targetCell.isHit) {
            this.fakeEnemyTurn();
            return;
        }

        targetCell.isHit = true;
        targetCell.baseSquare.setFillStyle(0xff9900);
        this.scene.cameras.main.pan(this.scene.scale.width / 2, this.scene.scale.height / 2, 600, 'Power2');
        this.scene.isLookingAtEnemy = false;
        this.startNextTurn();
    }
}
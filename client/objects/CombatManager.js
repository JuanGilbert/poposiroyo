import Phaser from 'phaser';
import { SocketManager } from '../network/SocketManager.js'; // <-- Import Sockets

export class CombatManager {
    constructor(scene) {
        this.scene = scene;
        this.turnQueue = [];
        this.generalTurnCount = 0;
        this.currentUnit = null;
        this.setupSocketListeners(); // Listen for opponent moves!
    }

    setupSocketListeners() {
        // When the server tells us someone attacked!
        SocketManager.on("attack_result", (data) => {
            const { attacker, x, y } = data;

            // Check if the attack came from the opponent
            if (attacker !== SocketManager.get().id) {
                console.log(`Opponent attacked at Col: ${x}, Row: ${y}`);

                // Pan camera to player board to watch the hit
                this.scene.cameras.main.pan(this.scene.scale.width / 2, this.scene.scale.height / 2, 600, 'Power2');
                this.scene.isLookingAtEnemy = false;

                // Apply the hit visually to the Player's board
                const targetCell = this.scene.playerBoard.grid[y][x];
                targetCell.isHit = true;
                targetCell.baseSquare.setFillStyle(0xff9900); // Just a generic hit visual for now

                // Move to the next turn!
                this.scene.time.delayedCall(1000, () => this.startNextTurn());
            }
        });
    }

    start() {
        this.generalTurnCount = 0;
        this.startNextTurn();
    }

    // --- BATTLE CLICK LOGIC ---
    handleClick(cell) {
        if (this.scene.playerActionState === 'ATTACKING') {
            if (!cell.isEnemyBoard) return;

            // 1. Instantly hide UI to prevent double-clicking
            this.scene.ui.setActionMenuVisible(false);

            // 2. Instead of calculating damage locally, TELL THE SERVER!
            // Send the column (x) and row (y) we clicked on
            SocketManager.emit("attack", {
                roomId: this.scene.roomId,
                x: cell.col,
                y: cell.row
            });

            // 3. We also apply the visual damage to our local screen instantly for a snappy feel
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

            // Wait for the server before advancing the turn
            this.startNextTurn();

        } else if (this.scene.playerActionState === 'MOVING') {
            // (We will wire up Movement to the server in the exact same way next!)
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
            // IT IS THE ENEMY'S TURN!
            this.scene.gameState = 'ENEMY_TURN';
            this.scene.ui.setActionMenuVisible(false);

            // NOTICE: fakeEnemyTurn() is GONE!
            // We literally do nothing and wait for setupSocketListeners() to hear the opponent's attack.
            console.log("Waiting for opponent to move...");
        }
    }
}
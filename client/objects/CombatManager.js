import Phaser from 'phaser';
import * as SocketManager from '../network/SocketManager.js';


export class CombatManager {
    constructor(scene) {
        this.scene = scene;
        this.turnQueue = [];
        this.generalTurnCount = 0;
        this.currentUnit = null;

        // Listen for the opponent's moves!
        SocketManager.on("combat_action_received", (data) => this.handleOpponentAction(data));
    }

    start() {
        this.generalTurnCount = 0;
        this.startNextTurn();
    }

    handleOpponentAction(data) {
        const { actionType, targetCoord } = data;

        if (actionType === 'MOVE') {
            const newCoords = [];
            for (let i = 0; i < this.currentUnit.tileSize; i++) {
                newCoords.push({ row: targetCoord.row + i, col: targetCoord.col });
            }
            this.scene.enemyBoard.moveUnit(this.currentUnit, newCoords);
            this.startNextTurn();

        } else if (actionType === 'ATTACK') {
            this.currentUnit.attackOffsets.forEach(offset => {
                const r = targetCoord.row + offset.r;
                const c = targetCoord.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const hitCell = this.scene.playerBoard.grid[r][c]; // Hitting our board!
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            this.scene.cameras.main.pan(this.scene.scale.width / 2, this.scene.scale.height / 2, 600, 'Power2');
            this.scene.isLookingAtEnemy = false;
            this.scene.time.delayedCall(1000, () => this.startNextTurn());
        }
    }

    handleClick(cell) {
        if (this.scene.playerActionState === 'ATTACKING') {
            if (!cell.isEnemyBoard) return;
            this.scene.ui.setActionMenuVisible(false);

            // Emit to server!
            SocketManager.emit("combat_action", {
                roomId: this.scene.registry.get('roomId'),
                actionType: 'ATTACK',
                targetCoord: { row: cell.row, col: cell.col }
            });

            // Apply locally
            const hideFogTurn = this.generalTurnCount + 4;
            this.currentUnit.revealOffsets.forEach(offset => {
                const r = cell.row + offset.r; const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const revCell = this.scene.enemyBoard.grid[r][c];
                    revCell.revealFog(); revCell.fogReturnTurn = hideFogTurn;
                }
            });
            this.currentUnit.attackOffsets.forEach(offset => {
                const r = cell.row + offset.r; const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const hitCell = this.scene.enemyBoard.grid[r][c];
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            this.startNextTurn();

        } else if (this.scene.playerActionState === 'MOVING') {
            if (cell.isEnemyBoard) return;

            // Emit to server!
            SocketManager.emit("combat_action", {
                roomId: this.scene.registry.get('roomId'),
                actionType: 'MOVE',
                targetCoord: { row: cell.row, col: cell.col }
            });

            const newCoords = [];
            for (let i = 0; i < this.currentUnit.tileSize; i++) {
                newCoords.push({ row: cell.row + i, col: cell.col });
            }
            this.scene.playerBoard.moveUnit(this.currentUnit, newCoords);
            this.scene.ui.setActionMenuVisible(false);
            this.startNextTurn();
        }
    }

    buildTurnQueue() {
        this.turnQueue = [...this.scene.activeUnits].filter(unit => !unit.isDead);
        this.turnQueue.sort((a, b) => b.speed - a.speed);
    }

    startNextTurn() {
        if (this.turnQueue.length === 0) this.buildTurnQueue();
        this.generalTurnCount++;

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                let cell = this.scene.enemyBoard.grid[r][c];
                if (!cell.isFogged && cell.fogReturnTurn > 0 && this.generalTurnCount >= cell.fogReturnTurn) cell.restoreFog();
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
            // No fake AI here. Just wait for Socket.io!
        }
    }
}
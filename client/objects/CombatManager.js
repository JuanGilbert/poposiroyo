import Phaser from 'phaser';
import * as SocketManager from '../network/SocketManager.js';

export class CombatManager {
    constructor(scene) {
        this.scene = scene;
        this.turnQueue = [];
        this.generalTurnCount = 0;
        this.currentUnit = null;
        this.isGameOver = false;

        SocketManager.on("combat_action_received", (data) => this.handleOpponentAction(data));
        SocketManager.on("game_over_received", (data) => this.handleGameOver(data));
    }

    start() {
        this.generalTurnCount = 0;
        this.isGameOver = false;
        this.startNextTurn();
    }

    handleOpponentAction(data) {
        if (this.isGameOver) return;
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
                    const hitCell = this.scene.playerBoard.grid[r][c];
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            this.scene.cameras.main.pan(this.scene.scale.width / 2, this.scene.scale.height / 2, 600, 'Power2');
            this.scene.isLookingAtEnemy = false;

            if (!this.checkWinCondition()) {
                this.scene.time.delayedCall(1000, () => this.startNextTurn());
            }
        }
    }

    handleClick(cell) {
        if (this.isGameOver) return;

        if (this.scene.playerActionState === 'ATTACKING') {
            if (!cell.isEnemyBoard) return;
            this.scene.ui.setActionMenuVisible(false);

            SocketManager.emit("combat_action", {
                roomId: this.scene.registry.get('roomId'),
                actionType: 'ATTACK',
                targetCoord: { row: cell.row, col: cell.col }
            });

            const hideFogTurn = this.generalTurnCount + 4;

            // FIX 1: Safely check if revealOffsets exists to prevent crashes!
            if (this.currentUnit.revealOffsets) {
                this.currentUnit.revealOffsets.forEach(offset => {
                    const r = cell.row + offset.r; const c = cell.col + offset.c;
                    if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                        const revCell = this.scene.enemyBoard.grid[r][c];
                        if (revCell.revealFog) revCell.revealFog();
                        revCell.fogReturnTurn = hideFogTurn;
                    }
                });
            }

            this.currentUnit.attackOffsets.forEach(offset => {
                const r = cell.row + offset.r; const c = cell.col + offset.c;
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    const hitCell = this.scene.enemyBoard.grid[r][c];
                    if (!hitCell.isHit) hitCell.applyDamage();
                }
            });

            // FIX 2: Wait 1000ms just like the opponent does so the turns stay perfectly synced!
            if (!this.checkWinCondition()) {
                this.scene.time.delayedCall(1000, () => this.startNextTurn());
            }

        } else if (this.scene.playerActionState === 'MOVING') {
            if (cell.isEnemyBoard) return;

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

    checkWinCondition() {
        const playerUnitsAlive = this.scene.activeUnits.filter(u => u.isPlayerUnit && !u.isDead);
        const enemyUnitsAlive = this.scene.activeUnits.filter(u => !u.isPlayerUnit && !u.isDead);
        const roomId = this.scene.registry.get('roomId');

        if (enemyUnitsAlive.length === 0) {
            this.isGameOver = true;
            SocketManager.emit("game_over", { roomId, isPlayer1Winner: this.scene.isPlayer1 });
            this.scene.scene.start('ResultScene', { isWin: true });
            return true;
        } else if (playerUnitsAlive.length === 0) {
            this.isGameOver = true;
            SocketManager.emit("game_over", { roomId, isPlayer1Winner: !this.scene.isPlayer1 });
            this.scene.scene.start('ResultScene', { isWin: false });
            return true;
        }
        return false;
    }

    handleGameOver(data) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        const didIWin = data.isPlayer1Winner === this.scene.isPlayer1;
        this.scene.scene.start('ResultScene', { isWin: didIWin });
    }

    buildTurnQueue() {
        this.turnQueue = [...this.scene.activeUnits].filter(unit => !unit.isDead);
        this.turnQueue.sort((a, b) => {
            if (b.speed !== a.speed) return b.speed - a.speed;

            const aIsPlayer1 = this.scene.isPlayer1 ? a.isPlayerUnit : !a.isPlayerUnit;
            const bIsPlayer1 = this.scene.isPlayer1 ? b.isPlayerUnit : !b.isPlayerUnit;

            if (aIsPlayer1 && !bIsPlayer1) return -1;
            if (!aIsPlayer1 && bIsPlayer1) return 1;
            return 0;
        });
    }

    startNextTurn() {
        if (this.isGameOver) return;
        this.turnQueue = this.turnQueue.filter(unit => !unit.isDead);

        if (this.turnQueue.length === 0) this.buildTurnQueue();
        if (this.turnQueue.length === 0) return;

        this.generalTurnCount++;

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                let cell = this.scene.enemyBoard.grid[r][c];
                if (!cell.isFogged && cell.fogReturnTurn > 0 && this.generalTurnCount >= cell.fogReturnTurn) {
                    if(cell.restoreFog) cell.restoreFog();
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
        }
    }
}
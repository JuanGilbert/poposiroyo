import * as SocketManager from '../network/SocketManager.js';

export class PlacementManager {
    constructor(scene) {
        this.scene = scene;
        this.selectedUnit = null;
        this.placementTime = 30;
        this.placementTimer = null;
    }

    start() {
        this.scene.gameState = 'PLACEMENT';
        this.selectedUnit = null;
        this.placementTime = 30;

        this.scene.ui.showPlacementUI(this.placementTime, () => this.end());

        this.placementTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.placementTime--;
                this.scene.ui.updatePlacementTimer(this.placementTime);
                if (this.placementTime <= 0) this.end();
            },
            callbackScope: this,
            loop: true
        });
    }

    // client/objects/PlacementManager.js (Inside the end() function)

    end() {
        if (this.scene.gameState !== 'PLACEMENT') return;
        if (this.placementTimer) this.placementTimer.remove();

        this.scene.ui.hidePlacementUI();
        this.scene.clearHighlights();
        this.scene.gameState = 'WAITING_FOR_OPPONENT';

        const myUnitsData = this.scene.activeUnits.map(unit => {
            return { name: unit.name, coordinates: unit.coordinates };
        });

        // 1. CHANGE THIS FROM "player_ready" TO "board_ready"
        SocketManager.emit("board_ready", {
            roomId: this.scene.registry.get('roomId'),
            units: myUnitsData
        });

        // 2. CHANGE THIS FROM "game_started" TO "combat_started"
        SocketManager.on("combat_started", (data) => {
            SocketManager.off("combat_started");
            // isPlayer1 is already set from the Lobby phase, so we don't need to set it here
            this.scene.spawnEnemyTeam(data.opponentUnits);
            this.scene.combatManager.start();
        });
    }

    handleClick(cell) {
        if (cell.isEnemyBoard) return;

        if (cell.hasUnit) {
            this.scene.clearHighlights();
            this.selectedUnit = cell.unitRef;
            this.scene.highlightUnit(this.selectedUnit, 0xffff00);
        } else if (this.selectedUnit) {
            const newCoords = [];
            for (let i = 0; i < this.selectedUnit.tileSize; i++) {
                newCoords.push({ row: cell.row + i, col: cell.col });
            }

            if (this.scene.playerBoard.isAreaAvailable(newCoords, this.selectedUnit)) {
                this.scene.playerBoard.moveUnit(this.selectedUnit, newCoords);
                this.scene.clearHighlights();
                this.selectedUnit = null;
            }
        }
    }
}
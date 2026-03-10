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

        // Delegate UI drawing to the BattleUI manager
        this.scene.ui.showPlacementUI(this.placementTime, () => this.end());

        // Start the countdown
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

    end() {
        if (this.scene.gameState !== 'PLACEMENT') return;

        if (this.placementTimer) this.placementTimer.remove();

        this.scene.ui.hidePlacementUI();
        this.scene.clearHighlights();
        this.scene.gameState = 'WAITING_FOR_OPPONENT';

        // Package up the team we drafted
        const myUnitsData = this.scene.activeUnits.map(unit => {
            return {
                name: unit.name,
                coordinates: unit.coordinates
            };
        });

        // Send our board to the server
        SocketManager.emit("player_ready", {
            roomId: this.scene.registry.get('roomId'),
            units: myUnitsData
        });

        // Wait for the opponent to finish placing theirs
        SocketManager.on("game_started", (data) => {
            SocketManager.off("game_started");
            this.scene.spawnEnemyTeam(data.opponentUnits);
            this.scene.combatManager.start();
        });
    }

    handleClick(cell) {
        if (cell.isEnemyBoard) return;

        if (cell.hasUnit) {
            // Select the clicked unit
            this.scene.clearHighlights();
            this.selectedUnit = cell.unitRef;
            this.scene.highlightUnit(this.selectedUnit, 0xffff00);
        } else if (this.selectedUnit) {
            // Try to move the selected unit to the empty square
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
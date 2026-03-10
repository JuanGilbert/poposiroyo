export class PlacementManager {
    constructor(scene) {
        this.scene = scene; // Keep a reference to the main GameScene
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

        // Hide UI via the manager
        this.scene.ui.hidePlacementUI();
        this.scene.clearHighlights();

        // CHANGE THIS: Tell the Combat Manager to take over!
        this.scene.combatManager.start();
    }

    handleClick(cell) {
        if (cell.isEnemyBoard) return; // Can't touch enemy board yet

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
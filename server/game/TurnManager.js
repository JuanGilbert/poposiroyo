class TurnManager {

    constructor() {
        this.currentTurn = "p1";
    }

    getTurn() {
        return this.currentTurn;
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === "p1" ? "p2" : "p1";
    }

}

module.exports = TurnManager;
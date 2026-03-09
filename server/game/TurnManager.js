class TurnManager {

    constructor(startPlayer = "p1") {
        this.currentTurn = startPlayer;
    }

    getTurn() {
        return this.currentTurn;
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === "p1" ? "p2" : "p1";
    }

}

module.exports = TurnManager;
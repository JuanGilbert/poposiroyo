const BattleshipLogic = require("./BattleshipLogic");
const TurnManager = require("./TurnManager");

class GameManager {

    constructor(board1, board2) {

        this.boards = {
            p1: board1,
            p2: board2
        };

        this.turnManager = new TurnManager();

        this.scores = {
            p1: 0,
            p2: 0
        };

    }

    attack(playerId, x, y) {

        if (this.turnManager.getTurn() !== playerId) {
            return { error: "Not your turn" };
        }

        const opponent = playerId === "p1" ? "p2" : "p1";

        const board = this.boards[opponent];

        const result = BattleshipLogic.checkHit(board, x, y);

        if (result === "hit") {
            this.scores[playerId]+= 1;
        }

        const gameOver = BattleshipLogic.isShipSunk(board);

        this.turnManager.switchTurn();

        return {
            result,
            nextTurn: this.turnManager.getTurn(),
            score: this.scores,
            gameOver
        };

    }

}

module.exports = GameManager;
const BattleshipLogic = require("./BattleshipLogic");
const TurnManager = require("./TurnManager");

class GameManager {

    constructor(matchId, board1, board2) {

        this.matchId = matchId;

        this.boards = {
            p1: board1,
            p2: board2
        };

        this.turnManager = new TurnManager();

        this.scores = {
            p1: 0,
            p2: 0
        };

        this.status = "battle";

    }

    attack(playerId, x, y) {

        if (this.status === "finished") {
            return { error: "Game already finished" };
        }

        if (this.turnManager.getTurn() !== playerId) {
            return { error: "Not your turn" };
        }

        const opponent = playerId === "p1" ? "p2" : "p1";
        const board = this.boards[opponent];

        // Validasi koordinat
        if (
            x < 0 ||
            y < 0 ||
            y >= board.length ||
            x >= board[0].length
        ) {
            return { error: "Invalid coordinates" };
        }

        // Cek apakah cell sudah pernah diserang
        if (board[y][x] === "hit" || board[y][x] === "miss") {
            return { error: "Cell already attacked" };
        }

        const result = BattleshipLogic.checkHit(board, x, y);

        if (result === "hit") {
            this.scores[playerId] += 1;
        }

        const gameOver = BattleshipLogic.areAllShipsDestroyed(board);

        let winner = null;

        if (gameOver) {
            this.status = "finished";
            winner = playerId;
        }

        // turn selalu berpindah
        this.turnManager.switchTurn();

        return {
            result,
            nextTurn: this.turnManager.getTurn(),
            score: this.scores,
            gameOver,
            winner
        };

    }

}

module.exports = GameManager;
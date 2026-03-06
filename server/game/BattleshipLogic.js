class BattleshipLogic {

    static checkHit(board, x, y) {

        if (board[y][x] === 1) {
            board[y][x] = "hit";
            return "hit";
        }

        if (board[y][x] === 0) {
            board[y][x] = "miss";
            return "miss";
        }

        return "already";
    }

    static isShipSunk(board) {

        for (let row of board) {
            for (let cell of row) {

                if (cell === 1) {
                    return false;
                }

            }
        }

        return true;
    }

}

module.exports = BattleshipLogic;
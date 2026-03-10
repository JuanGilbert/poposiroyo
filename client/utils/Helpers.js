// server/utils/helpers.js

function generateEmptyBoard(size) {
    const board = [];
    for (let i = 0; i < size; i++) {
        board.push(new Array(size).fill(0));
    }
    return board;
}

function isValidCoordinate(x, y, size) {
    return x >= 0 && y >= 0 && x < size && y < size;
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = {
    generateEmptyBoard,
    isValidCoordinate,
    randomInt
};
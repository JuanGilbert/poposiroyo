// shared/gameConfig.js

const BOARD_SIZE = 10;

const SHIPS = [
    { name: "Carrier", size: 5 },
    { name: "Battleship", size: 4 },
    { name: "Cruiser", size: 3 },
    { name: "Submarine", size: 3 },
    { name: "Destroyer", size: 2 }
];

module.exports = {
    BOARD_SIZE,
    SHIPS
};
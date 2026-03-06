const GameManager = require("./game/GameManager");

// contoh board 8x8
const board1 = [
    [0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
];

const board2 = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
];

const game = new GameManager(board1, board2);

console.log("Player 1 attack (3,1)");
console.log(game.attack("p1",3,1));

console.log("Player 2 attack (1,1)");
console.log(game.attack("p2",1,1));

console.log("Player 1 attack (4,1)");
console.log(game.attack("p1",4,1));

console.log("Player 2 attack (1,2)");
console.log(game.attack("p2",1,2));
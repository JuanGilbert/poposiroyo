import { Cell } from './Cell.js';

export class Board {
    constructor(scene, startX, startY, cellSize, isEnemyBoard, rows = 10, cols = 10) {
        this.scene = scene;
        this.startX = startX;
        this.startY = startY;
        this.cellSize = cellSize;
        this.isEnemyBoard = isEnemyBoard;
        this.rows = rows;
        this.cols = cols;

        this.grid = [];
        this.createGrid();
    }

    createGrid() {
        for (let row = 0; row < this.rows; row++) {
            let gridRow = [];
            for (let col = 0; col < this.cols; col++) {
                const x = this.startX + (col * this.cellSize);
                const y = this.startY + (row * this.cellSize);
                const cell = new Cell(this.scene, this, x, y, this.cellSize, row, col, this.isEnemyBoard);
                gridRow.push(cell);
            }
            this.grid.push(gridRow);
        }
    }

    isAreaAvailable(coordsArray, ignoreUnit = null) {
        for (let coord of coordsArray) {
            if (coord.row < 0 || coord.row >= this.rows || coord.col < 0 || coord.col >= this.cols) {
                return false;
            }
            const cell = this.grid[coord.row][coord.col];
            if (cell.hasUnit && cell.unitRef !== ignoreUnit) {
                return false;
            }
        }
        return true;
    }

    // Places a brand new unit on the board
    spawnUnit(unit, footprintArray) {
        footprintArray.forEach(coord => {
            const cell = this.grid[coord.row][coord.col];
            cell.hasUnit = true;
            cell.unitRef = unit;
            cell.baseSquare.setFillStyle(unit.isPlayerUnit ? 0x2196f3 : 0xff9900);
        });
        unit.updatePosition(footprintArray);
    }

    // Clears the unit from its old spot and moves it to the new array of coordinates
    moveUnit(unit, newCoordsArray) {
        // 1. Clear old cells and set color back to Green
        unit.coordinates.forEach(coord => {
            const cell = this.grid[coord.row][coord.col];
            cell.hasUnit = false;
            cell.unitRef = null;
            cell.baseSquare.setFillStyle(0x4caf50);
        });

        // 2. Update new cells and set color to Blue/Orange
        newCoordsArray.forEach(coord => {
            const cell = this.grid[coord.row][coord.col];
            cell.hasUnit = true;
            cell.unitRef = unit;
            cell.baseSquare.setFillStyle(unit.isPlayerUnit ? 0x2196f3 : 0xff9900);
        });

        unit.updatePosition(newCoordsArray);
    }
}
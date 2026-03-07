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

        this.grid = []; // This will be a 2D array: grid[row][col]

        this.createGrid();
    }

    createGrid() {
        // Loop through the 10 rows
        for (let row = 0; row < this.rows; row++) {
            let gridRow = [];

            // Loop through the 10 columns inside each row
            for (let col = 0; col < this.cols; col++) {
                // Calculate the exact pixel X and Y on the screen
                const x = this.startX + (col * this.cellSize);
                const y = this.startY + (row * this.cellSize);

                // Instantiate the Cell
                const cell = new Cell(this.scene, this, x, y, this.cellSize, row, col, this.isEnemyBoard);

                // Add the cell to our temporary row array
                gridRow.push(cell);
            }

            // Add the completed row to the main grid
            this.grid.push(gridRow);
        }
    }

    // Check if a set of coordinates is "walkable"
    isAreaAvailable(coordsArray, ignoreUnit = null) {
        for (let coord of coordsArray) {
            // 1. Out of bounds check
            if (coord.row < 0 || coord.row >= this.rows || coord.col < 0 || coord.col >= this.cols) {
                return false;
            }

            // 2. Occupied check
            const cell = this.grid[coord.row][coord.col];
            if (cell.hasUnit && cell.unitRef !== ignoreUnit) {
                return false; // Someone else is standing here!
            }
        }
        return true;
    }

// Clear unit from old cells and move to new cells
    moveUnit(unit, newRow, newCol) {
        // 1. Clear old cells
        unit.coordinates.forEach(coord => {
            const cell = this.grid[coord.row][coord.col];
            cell.hasUnit = false;
            cell.unitRef = null;
        });

        // 2. Calculate new footprint (Example for 1x1, can be expanded for Big Units)
        const newCoords = [{row: newRow, col: newCol}];

        // 3. Update new cells
        newCoords.forEach(coord => {
            const cell = this.grid[coord.row][coord.col];
            cell.hasUnit = true;
            cell.unitRef = unit;
        });

        unit.updatePosition(newCoords);
    }
}
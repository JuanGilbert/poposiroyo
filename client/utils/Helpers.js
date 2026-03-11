import { BOARD_ROWS, BOARD_COLS } from './Constants.js';

// --- GRID ---

export function isInBounds(row, col) {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

export function generateFootprint(startRow, startCol, tileSize) {
    const coords = [];
    for (let i = 0; i < tileSize; i++) {
        coords.push({ row: startRow + i, col: startCol });
    }
    return coords;
}

export function manhattanDistance(coordA, coordB) {
    return Math.abs(coordA.row - coordB.row) + Math.abs(coordA.col - coordB.col);
}

// --- UNITS ---

export function getAliveUnits(units) {
    return units.filter(unit => !unit.isDead);
}

export function getAlivePlayerUnits(units) {
    return units.filter(unit => unit.isPlayerUnit && !unit.isDead);
}

export function getAliveEnemyUnits(units) {
    return units.filter(unit => !unit.isPlayerUnit && !unit.isDead);
}

export function sortBySpeed(units) {
    return [...units].sort((a, b) => b.speed - a.speed);
}

export function serializeUnits(units) {
    return units.map(unit => ({ name: unit.name, coordinates: unit.coordinates }));
}

// --- UI ---

export function calcTurnTrackerStartX(showCount, boxSize, spacing) {
    return -(((showCount * boxSize) + ((showCount - 1) * spacing)) / 2) + (boxSize / 2);
}
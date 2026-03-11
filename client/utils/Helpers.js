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

// Tampilkan toast notification di scene Phaser
// Dipakai di NetworkEvents.js _onMatchFound
export function showToast(scene, message, duration = 2000) {
    if (!scene) return;

    const screenWidth = scene.scale.width;
    const screenHeight = scene.scale.height;

    const toast = scene.add.text(screenWidth / 2, screenHeight * 0.15, message, {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    scene.time.delayedCall(duration, () => {
        if (toast && toast.active) toast.destroy();
    });
}
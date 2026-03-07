export class Unit {
    constructor(blueprint, isPlayerUnit) {
        // Load stats from the blueprint
        this.name = blueprint.name;
        this.tileSize = blueprint.tileSize;
        this.maxHp = blueprint.hp;
        this.speed = blueprint.speed;
        this.moveRange = blueprint.moveRange;
        this.attackRange = blueprint.attackRange;
        this.attackOffsets = blueprint.attackOffsets;
        this.revealOffsets = blueprint.revealOffsets || blueprint.attackOffsets;
        this.personalTurnCount = 0;

        // Dynamic Game State
        this.currentHp = this.maxHp;
        this.isPlayerUnit = isPlayerUnit; // true if yours, false if enemy
        this.isDead = false;

        // Array of {row, col} objects.
        // If tileSize is 1, this array just has one item.
        this.coordinates = [];
    }

    takeDamage(amount = 1) {
        this.currentHp -= amount;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.isDead = true;
            console.log(`${this.name} was defeated!`);
        }
    }

    // Call this when the unit uses its Move action
    updatePosition(newCoordinates) {
        this.coordinates = newCoordinates;
    }

    takePersonalTurn() {
        this.personalTurnCount++;
        // Future code goes here:
        // if (this.hasPoison) this.takeDamage(1);
        console.log(`${this.name} starts its personal turn (Personal Turn ${this.personalTurnCount})`);
    }
}
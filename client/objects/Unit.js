export class Unit {

    constructor(blueprint, isPlayerUnit) {

        this.name = blueprint.name

        this.tileSize = blueprint.tileSize || 1
        this.maxHp = blueprint.hp || 1
        this.speed = blueprint.speed || 0
        this.moveRange = blueprint.moveRange || 0
        this.attackRange = blueprint.attackRange || 1

        this.attackOffsets = blueprint.attackOffsets || []
        this.revealOffsets = blueprint.revealOffsets || this.attackOffsets

        this.personalTurnCount = 0

        this.currentHp = this.maxHp
        this.isPlayerUnit = isPlayerUnit
        this.isDead = false

        this.coordinates = []
    }

    takeDamage(amount = 1) {

        this.currentHp -= amount

        if (this.currentHp <= 0) {

            this.currentHp = 0
            this.isDead = true

            console.log(`${this.name} was defeated!`)
        }
    }

    updatePosition(newCoordinates) {

        this.coordinates = newCoordinates
    }

    takePersonalTurn() {

        this.personalTurnCount++

        console.log(
            `${this.name} starts its personal turn (Personal Turn ${this.personalTurnCount})`
        )
    }
}
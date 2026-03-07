import Phaser from 'phaser';

export class Cell extends Phaser.GameObjects.Container {
    constructor(scene, board, x, y, size, row, col, isEnemyBoard) {
        super(scene, x, y);
        this.scene = scene;
        this.board = board;
        this.row = row;
        this.col = col;
        this.isEnemyBoard = isEnemyBoard;
        this.fogReturnTurn = 0;

        // States
        this.hasUnit = false;
        this.unitRef = null; // Which specific unit is sitting here
        this.isHit = false;
        this.isFogged = isEnemyBoard; // Enemy board starts fogged!

        // 1. The Base Square (Grass/Floor)
        this.baseSquare = scene.add.rectangle(0, 0, size, size, 0x4caf50);
        this.baseSquare.setStrokeStyle(1, 0x000000);

        // 2. The Fog Cover (Dark Grey/Black)
        this.fogSquare = scene.add.rectangle(0, 0, size, size, 0x1a1a1a);
        this.fogSquare.setVisible(this.isFogged);

        // Add them to this container
        this.add([this.baseSquare, this.fogSquare]);

        // Sizing and interactivity
        this.setSize(size, size);
        scene.add.existing(this);
        this.setInteractive();

        this.on('pointerdown', this.handleClick, this);
    }

    handleClick() {
        // Emit to GameScene. We don't change colors here anymore!
        this.scene.events.emit('cellClicked', this);
    }

    // The GameScene will call this when a spell hits or fog lifts
    revealFog() {
        this.isFogged = false;
        this.fogSquare.setVisible(false);
    }

    // The GameScene will call this at the end of the turn
    restoreFog() {
        if (this.isEnemyBoard) {
            this.isFogged = true;
            this.fogSquare.setVisible(true);
            this.fogReturnTurn = 0; // Reset the timer
        }
    }

    applyDamage() {
        this.isHit = true;
        if (this.hasUnit) {
            this.baseSquare.setFillStyle(0xff0000); // Red Hit
            if (this.unitRef) this.unitRef.takeDamage(1);
        } else {
            this.baseSquare.setFillStyle(0x808080); // Grey Miss
        }
    }
}
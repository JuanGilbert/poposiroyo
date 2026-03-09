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
        this.unitRef = null;
        this.isHit = false;
        this.isFogged = isEnemyBoard;

        // 1. The Base Square
        this.baseSquare = scene.add.rectangle(0, 0, size, size, 0x4caf50).setOrigin(0);
        this.baseSquare.setStrokeStyle(1, 0x000000);

        // 2. The Fog Square (Fix: Added setStrokeStyle to prevent squares from blending together!)
        this.fogSquare = scene.add.rectangle(0, 0, size, size, 0x1a1a1a).setOrigin(0);
        this.fogSquare.setStrokeStyle(1, 0x000000);
        this.fogSquare.setVisible(this.isFogged);

        this.add([this.baseSquare, this.fogSquare]);

        // Sizing
        this.setSize(size, size);
        scene.add.existing(this);

        // 3. FIX: Create a custom Hit Area so clicks perfectly match the top-left visuals
        const hitArea = new Phaser.Geom.Rectangle(0, 0, size, size);
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

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
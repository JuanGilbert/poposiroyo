import Phaser from 'phaser'

export class Bootscene extends Phaser.Scene {
    constructor() {
        super('Bootscene');
    }

    preload() {
        // Preload image for loading screen
    }

    create() {
        this.scene.start('Preload');
    }
}
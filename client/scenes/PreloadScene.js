import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene')
    }

    preload() {
        // Load assets
    }

    create() {
        console.log('Loading assets');
        this.scene.start('MenuScene');
    }
}
import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
    }

    create() {
        // This green text will prove it's working!
        this.add.text(100, 100, "Game Score is !", { fill: '#00ff00', fontSize: '32px' });
    }
}
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // This green text will prove it's working!
        this.add.text(100, 100, "Game Scene is Alive!", { fill: '#00ff00', fontSize: '32px' });
    }
}
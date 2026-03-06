import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // This green text will prove it's working!
        this.add.text(100, 100, "Game Scene is Alive!", { fill: '#00ff00', fontSize: '32px' });
    }
}
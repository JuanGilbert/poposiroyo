import Phaser from 'phaser';

export class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    create() {
        // This green text will prove it's working!
        this.add.text(100, 100, "This is Lobby scene", { fill: '#00ff00', fontSize: '32px' });
        this.scene.start('GameScene');
        console.log('Lobby scene started!');
    }
}
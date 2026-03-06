import Phaser from 'phaser';
import { Bootscene } from './scenes/Bootscene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#34495e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [
        Bootscene,
        PreloadScene,
        LobbyScene,
        MenuScene,
        GameScene
    ]
};

const game = new Phaser.Game(config);
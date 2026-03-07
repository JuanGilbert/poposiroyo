import Phaser from 'phaser';
import { Bootscene } from './scenes/Bootscene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        // Change from FIT to RESIZE
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // When using RESIZE, width and height become the "minimum" starting size,
        // but Phaser will immediately override them to match the phone screen.
        width: '100%',
        height: '100%'
    },
    backgroundColor: '#34495e',

    scene: [
        Bootscene,
        PreloadScene,
        MenuScene,
        LobbyScene,
        GameScene
    ]
};

const game = new Phaser.Game(config);
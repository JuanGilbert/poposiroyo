import Phaser from 'phaser';
import { Bootscene } from './scenes/Bootscene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Stretches to fit the screen without warping
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game on the phone
        width: 390,
        height: 844
    },
    backgroundColor: '#34495e',
    scene: [Bootscene, PreloadScene, LobbyScene, MenuScene, GameScene]
};

    scene: [
        Bootscene,
        PreloadScene,
        LobbyScene,
        MenuScene,
        GameScene
    ]
};

const game = new Phaser.Game(config);
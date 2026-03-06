import Phaser from 'phaser';
import { Bootscene } from 'scenes/Bootscene';
import { PreloadScene } from 'scenes/PreloadScene';
import { LobbyScene } from 'scenes/LobbyScene';
import { MenuScene } from 'scenes/MenuScene';
import { GameScene } from 'scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#34495e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down style (no gravity)
            debug: false
        }
    },
    scene: {
        boot: Bootscene,
        preload: PreloadScene,
        lobby: LobbyScene,
        menu: MenuScene,
        game: GameScene
    }
};

const game = new Phaser.Game(config);
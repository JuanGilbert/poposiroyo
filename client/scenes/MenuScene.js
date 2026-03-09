import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.add.text(screenWidth / 2, screenHeight * 0.3, "RPG\nBATTLE", {
            fontSize: '48px',
            fill: '#fff4e6',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const lobbyButton = this.add.text(screenWidth / 2, screenHeight * 0.6, "START GAME", {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#8c9b7a',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5);

        const settingsBtn = this.add.text(screenWidth / 2, screenHeight * 0.75, "⚙️ SETTINGS", {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerdown', () => settingsBtn.setScale(0.9));
        settingsBtn.on('pointerup', () => {
            settingsBtn.setScale(1);
            // Launch runs it on top instead of switching to it
            this.scene.launch('SettingsScene');
        });

        lobbyButton.setInteractive({ useHandCursor: true });

        lobbyButton.on('pointerdown', () => {
            lobbyButton.setScale(0.95);
        });

        lobbyButton.on('pointerup', () => {
            lobbyButton.setScale(1);
            // Change the destination to MatchmakingScene!
            this.scene.start('MatchmakingScene');
        });
    }
}
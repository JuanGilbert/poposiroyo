import Phaser from 'phaser';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // 1. Dark semi-transparent background overlay to dim the game behind it
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7).setOrigin(0);

        const popupX = screenWidth / 2;
        const popupY = screenHeight / 2;

        // 2. The Popup Box
        this.add.rectangle(popupX, popupY, 300, 350, 0x333333).setStrokeStyle(4, 0xaaaaaa);
        this.add.text(popupX, popupY - 120, "SETTINGS", {
            fontSize: '32px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // 3. Dummy Toggle Buttons (Music & SFX)
        const musicBtn = this.add.text(popupX, popupY - 30, "MUSIC: ON", {
            fontSize: '24px', fill: '#4caf50', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicBtn.on('pointerdown', () => {
            const isOn = musicBtn.text.includes("ON");
            musicBtn.setText(isOn ? "MUSIC: OFF" : "MUSIC: ON");
            musicBtn.setColor(isOn ? '#f44336' : '#4caf50');
        });

        const sfxBtn = this.add.text(popupX, popupY + 30, "SFX: ON", {
            fontSize: '24px', fill: '#4caf50', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        sfxBtn.on('pointerdown', () => {
            const isOn = sfxBtn.text.includes("ON");
            sfxBtn.setText(isOn ? "SFX: OFF" : "SFX: ON");
            sfxBtn.setColor(isOn ? '#f44336' : '#4caf50');
        });

        // 4. Close Button
        const closeBtn = this.add.rectangle(popupX, popupY + 120, 150, 50, 0xd32f2f).setInteractive({ useHandCursor: true });
        this.add.text(popupX, popupY + 120, "CLOSE", {
            fontSize: '20px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        closeBtn.on('pointerdown', () => closeBtn.setScale(0.95));
        closeBtn.on('pointerup', () => {
            // This stops the overlay and returns focus to the scene underneath it!
            this.scene.stop();
        });
    }
}
import Phaser from 'phaser';

export class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.add.text(screenWidth / 2, screenHeight * 0.2, "FRIENDLY MATCH", {
            fontSize: '36px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // CREATE ROOM BUTTON
        const createRoomBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.45, 250, 70, 0x4caf50).setInteractive({ useHandCursor: true });
        this.add.text(screenWidth / 2, screenHeight * 0.45, "CREATE ROOM", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // JOIN ROOM BUTTON
        const joinRoomBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.65, 250, 70, 0xff9800).setInteractive({ useHandCursor: true });
        this.add.text(screenWidth / 2, screenHeight * 0.65, "JOIN ROOM", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // BACK BUTTON
        const backBtn = this.add.text(screenWidth / 2, screenHeight * 0.85, "BACK", {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });


        // --- BUTTON LOGIC ---
        createRoomBtnBg.on('pointerdown', () => createRoomBtnBg.setScale(0.95));
        createRoomBtnBg.on('pointerup', () => {
            createRoomBtnBg.setScale(1);
            this.scene.start('LobbyScene', { gameMode: 'friendly_host' });
        });

        joinRoomBtnBg.on('pointerdown', () => joinRoomBtnBg.setScale(0.95));
        joinRoomBtnBg.on('pointerup', () => {
            joinRoomBtnBg.setScale(1);
            this.scene.start('LobbyScene', { gameMode: 'friendly_join' });
        });

        backBtn.on('pointerdown', () => this.scene.start('MatchmakingScene'));
    }
}
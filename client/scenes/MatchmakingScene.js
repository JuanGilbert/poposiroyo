import Phaser from 'phaser';
import * as SocketManager from '../network/SocketManager.js';
import { sendQuickMatch, sendCancelMatchmaking, initNetworkEvents } from '../network/NetworkEvents.js';

export class MatchmakingScene extends Phaser.Scene {
    constructor() {
        super('MatchmakingScene');
        this.isSearching = false;
    }

    create() {
        // 2. Connect to the server as soon as they enter the matchmaking screen
        SocketManager.connect();

        // Initialize network listeners so the scene can hear "match_found"
        initNetworkEvents(this);

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // --- 1. MAIN UI GROUP ---
        const title = this.add.text(screenWidth / 2, screenHeight * 0.2, "CHOOSE MODE", { fontSize: '36px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const rankedBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.45, 250, 70, 0xd32f2f).setInteractive({ useHandCursor: true });
        const rankedTxt = this.add.text(screenWidth / 2, screenHeight * 0.45, "RANKED", { fontSize: '26px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const friendlyBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.65, 250, 70, 0x1976d2).setInteractive({ useHandCursor: true });
        const friendlyTxt = this.add.text(screenWidth / 2, screenHeight * 0.65, "FRIENDLY", { fontSize: '26px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const backBtn = this.add.text(screenWidth / 2, screenHeight * 0.85, "BACK", { fontSize: '20px', fill: '#aaaaaa' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.mainUIElements = [title, rankedBtnBg, rankedTxt, friendlyBtnBg, friendlyTxt, backBtn];

        // --- 2. SEARCHING UI GROUP ---
        const searchTxt = this.add.text(screenWidth / 2, screenHeight * 0.4, "Searching for Opponent...", { fontSize: '24px', fill: '#ffcc00', fontStyle: 'bold' }).setOrigin(0.5);
        this.loaderGraphic = this.add.arc(screenWidth / 2, screenHeight * 0.55, 40, 0, 270, false, 0x000000).setStrokeStyle(6, 0xffcc00);
        const cancelBtn = this.add.text(screenWidth / 2, screenHeight * 0.75, "CANCEL", { fontSize: '20px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.searchingUIElements = [searchTxt, this.loaderGraphic, cancelBtn];
        this.searchingUIElements.forEach(el => el.setVisible(false));

        // --- 3. BUTTON LOGIC ---
        rankedBtnBg.on('pointerup', () => {
            rankedBtnBg.setScale(1);

            this.mainUIElements.forEach(el => el.setVisible(false));
            this.searchingUIElements.forEach(el => el.setVisible(true));
            this.isSearching = true;

            // Trigger server matchmaking logic
            sendQuickMatch();
        });

        cancelBtn.on('pointerdown', () => {
            this.isSearching = false;
            this.searchingUIElements.forEach(el => el.setVisible(false));
            this.mainUIElements.forEach(el => el.setVisible(true));

            // Tell the server we backed out!
            sendCancelMatchmaking();
        });

        friendlyBtnBg.on('pointerdown', () => friendlyBtnBg.setScale(0.95));
        friendlyBtnBg.on('pointerup', () => {
            friendlyBtnBg.setScale(1);
            this.scene.start('RoomScene');
        });

        backBtn.on('pointerdown', () => {
            SocketManager.disconnect(); // Disconnect if they back out to main menu
            this.scene.start('MenuScene');
        });
    }

    update() {
        if (this.isSearching && this.loaderGraphic) {
            this.loaderGraphic.angle += 6;
        }
    }
}
import Phaser from 'phaser';
import { sendTeam } from '../network/NetworkEvents.js';

export class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    // 1. ADD THIS TO CATCH THE ROOM ID FROM MATCHMAKING
    init(data) {
        this.roomId = data.roomId;
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.selectedTeam = [];
        this.maxTeamSize = 3;

        const gameConfig = this.registry.get('gameConfig');
        const CHARACTER_DATA = gameConfig.characters;
        const characterNames = Object.keys(CHARACTER_DATA);

        this.add.text(screenWidth / 2, screenHeight * 0.1, "DRAFT YOUR SQUAD", {
            fontSize: '28px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.counterText = this.add.text(screenWidth / 2, screenHeight * 0.18, `0 / ${this.maxTeamSize} Selected`, {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        let startY = screenHeight * 0.35;

        characterNames.forEach((charName, index) => {
            const cardBg = this.add.rectangle(screenWidth / 2, startY + (index * 80), 200, 60, 0x333333).setOrigin(0.5);
            cardBg.setStrokeStyle(2, 0x888888);

            this.add.text(screenWidth / 2, startY + (index * 80), charName, {
                fontSize: '22px', fill: '#ffffff'
            }).setOrigin(0.5);

            cardBg.setInteractive({ useHandCursor: true });
            cardBg.on('pointerdown', () => {
                if (this.selectedTeam.length >= this.maxTeamSize) return;

                this.selectedTeam.push(charName);
                cardBg.setFillStyle(0x4caf50);
                cardBg.disableInteractive();

                this.counterText.setText(`${this.selectedTeam.length} / ${this.maxTeamSize} Selected`);

                if (this.selectedTeam.length === this.maxTeamSize) {
                    this.showStartButton(screenWidth, screenHeight);
                }
            });
        });
    }

    showStartButton(screenWidth, screenHeight) {
        const startBtn = this.add.rectangle(screenWidth / 2, screenHeight * 0.85, 250, 70, 0xff0000).setOrigin(0.5);
        this.add.text(screenWidth / 2, screenHeight * 0.85, "ENTER BATTLE", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        startBtn.setInteractive({ useHandCursor: true });
        startBtn.on('pointerdown', () => {

            // 2. PASS 'this' SO THE NETWORK EVENT MANAGER CAN USE IT
            sendTeam(this.selectedTeam, this);

            startBtn.setFillStyle(0x555555);
            startBtn.disableInteractive();
        });
    }
}
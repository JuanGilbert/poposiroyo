import Phaser from 'phaser';
import { sendTeam } from '../network/NetworkEvents.js';
import * as SocketManager from '../network/SocketManager.js';

export class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    init(data) {
        // Bulletproof the roomId by checking the registry as a fallback
        this.roomId = data.roomId || this.registry.get('roomId');
        this.registry.set('roomId', this.roomId); // Lock it in globally!
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // This is the array that stores the picked characters!
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

        // --- TIMER SETUP ---
        this.timeLeft = 30; // 30 seconds to pick

        this.timerText = this.add.text(screenWidth / 2, 50, `Time: ${this.timeLeft}`, {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ff0000'
        }).setOrigin(0.5);

        this.lobbyTimer = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true
        });

        // Listen for the Server Kick
        SocketManager.on("lobby_kicked", (data) => {
            console.warn("KICKED FROM LOBBY:", data.reason);
            if (this.lobbyTimer) this.lobbyTimer.remove();

            // Transition to Menu instantly.
            this.scene.start('MenuScene');
        });
    }

    showStartButton(screenWidth, screenHeight) {
        this.startBtn = this.add.rectangle(screenWidth / 2, screenHeight * 0.85, 250, 70, 0xff0000).setOrigin(0.5);
        this.add.text(screenWidth / 2, screenHeight * 0.85, "ENTER BATTLE", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startBtn.setInteractive({ useHandCursor: true });
        this.startBtn.on('pointerdown', () => {
            // Player clicked it manually, so stop the clock!
            if (this.lobbyTimer) this.lobbyTimer.remove();

            sendTeam(this.selectedTeam, this);

            this.startBtn.setFillStyle(0x555555);
            this.startBtn.disableInteractive();
        });
    }

    tickTimer() {
        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        if (this.timeLeft <= 0) {
            this.lobbyTimer.remove(); // Stop the clock

            // Grab the safest Room ID
            const safeRoomId = this.roomId || this.registry.get('roomId');
            console.log("Timer hit 0! Room ID is:", safeRoomId);

            if (this.selectedTeam.length < this.maxTeamSize) {
                console.log("Not enough units selected. Requesting server kick...");

                // Emitting to the server
                SocketManager.emit("lobby_timeout_kick", {
                    roomId: safeRoomId
                });

            } else {
                console.log("Team is ready. Forcing auto-start...");

                if (this.startBtn) {
                    this.startBtn.setFillStyle(0x555555);
                    this.startBtn.disableInteractive();
                }

                sendTeam(this.selectedTeam, this);
            }
        }
    }
}
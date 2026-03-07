import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.add.text(screenWidth / 2, screenHeight * 0.3, "BARISTA\nBATTLE", {
            fontSize: '48px',
            fill: '#fff4e6', // Creamy latte white
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const lobbyButton = this.add.text(screenWidth / 2, screenHeight * 0.6, "ENTER LOBBY", {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#8c9b7a', // Matcha green
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5);

        // 4. Make it interactive (clickable/tappable)
        lobbyButton.setInteractive({ useHandCursor: true });

        // 5. Add the "Juice" (Button animations and logic)
        lobbyButton.on('pointerdown', () => {
            // Shrink slightly when the player's finger presses down
            lobbyButton.setScale(0.95);
        });

        lobbyButton.on('pointerup', () => {
            // Snap back to normal size when released
            lobbyButton.setScale(1);

            // Launch the Lobby Scene!
            this.scene.start('LobbyScene');
        });
    }
}
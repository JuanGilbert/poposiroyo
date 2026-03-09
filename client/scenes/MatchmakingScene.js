import Phaser from 'phaser';

export class MatchmakingScene extends Phaser.Scene {
    constructor() {
        super('MatchmakingScene');
        this.isSearching = false; // Tracks if the loading spinner should rotate
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // --- 1. MAIN UI GROUP ---
        // We put these in an array so we can easily hide them all at once
        const title = this.add.text(screenWidth / 2, screenHeight * 0.2, "CHOOSE MODE", {
            fontSize: '36px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const rankedBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.45, 250, 70, 0xd32f2f).setInteractive({ useHandCursor: true });
        const rankedTxt = this.add.text(screenWidth / 2, screenHeight * 0.45, "RANKED", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const friendlyBtnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.65, 250, 70, 0x1976d2).setInteractive({ useHandCursor: true });
        const friendlyTxt = this.add.text(screenWidth / 2, screenHeight * 0.65, "FRIENDLY", {
            fontSize: '26px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const backBtn = this.add.text(screenWidth / 2, screenHeight * 0.85, "BACK", {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.mainUIElements = [title, rankedBtnBg, rankedTxt, friendlyBtnBg, friendlyTxt, backBtn];

        // --- 2. SEARCHING UI GROUP ---
        const searchTxt = this.add.text(screenWidth / 2, screenHeight * 0.4, "Searching for Opponent...", {
            fontSize: '24px', fill: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5);

        // A simple circle with a gap in it to act as our loading spinner
        this.loaderGraphic = this.add.arc(screenWidth / 2, screenHeight * 0.55, 40, 0, 270, false, 0x000000).setStrokeStyle(6, 0xffcc00);

        const cancelBtn = this.add.text(screenWidth / 2, screenHeight * 0.75, "CANCEL", {
            fontSize: '20px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.searchingUIElements = [searchTxt, this.loaderGraphic, cancelBtn];

        // Hide the searching UI by default
        this.searchingUIElements.forEach(el => el.setVisible(false));

        // --- 3. BUTTON LOGIC ---
        let searchTimer = null;

        rankedBtnBg.on('pointerdown', () => rankedBtnBg.setScale(0.95));
        rankedBtnBg.on('pointerup', () => {
            rankedBtnBg.setScale(1);

            // 1. Swap the UI
            this.mainUIElements.forEach(el => el.setVisible(false));
            this.searchingUIElements.forEach(el => el.setVisible(true));
            this.isSearching = true;

            // 2. Start the fake queue (wait 3 seconds, then go to Lobby)
            searchTimer = this.time.delayedCall(3000, () => {
                this.scene.start('LobbyScene', { gameMode: 'ranked' });
            });
        });

        cancelBtn.on('pointerdown', () => {
            // 1. Stop the timer from firing
            if (searchTimer) searchTimer.remove();

            // 2. Stop the animation and swap the UI back
            this.isSearching = false;
            this.searchingUIElements.forEach(el => el.setVisible(false));
            this.mainUIElements.forEach(el => el.setVisible(true));
        });

        friendlyBtnBg.on('pointerdown', () => friendlyBtnBg.setScale(0.95));
        friendlyBtnBg.on('pointerup', () => {
            friendlyBtnBg.setScale(1);
            // Go to the new RoomScene!
            this.scene.start('RoomScene');
        });

        backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }

    // --- 4. ANIMATION LOOP ---
    update() {
        // If we are currently searching, rotate the loader graphic every frame
        if (this.isSearching && this.loaderGraphic) {
            this.loaderGraphic.angle += 6;
        }
    }
}
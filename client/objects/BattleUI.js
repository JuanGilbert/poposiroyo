export class BattleUI {
    constructor(scene) {
        this.scene = scene;
        this.screenWidth = scene.scale.width;
        this.screenHeight = scene.scale.height;

        // UI Groups
        this.actionMenuElements = [];
        this.turnTrackerContainer = scene.add.container(this.screenWidth / 2, 60).setScrollFactor(0).setDepth(100);
        this.readyContainer = null;
        this.placementTimerText = null;

        this.createSettingsIcon();
        this.createToggleButton();
        this.createActionMenu();
    }

    // --- 1. SETTINGS & CAMERA TOGGLE ---
    createSettingsIcon() {
        const settingsIcon = this.scene.add.text(30, 30, "⚙️", { fontSize: '28px' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        settingsIcon.on('pointerdown', () => settingsIcon.setScale(0.9));
        settingsIcon.on('pointerup', () => {
            settingsIcon.setScale(1);
            this.scene.scene.launch('SettingsScene');
        });
    }

    createToggleButton() {
        const xPos = this.screenWidth - 60;
        const yPos = this.screenHeight - 60;
        const btnBg = this.scene.add.circle(xPos, yPos, 35, 0xffd700).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        const btnIcon = this.scene.add.text(xPos, yPos, "🔄", { fontSize: '30px' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        btnBg.setInteractive(new Phaser.Geom.Circle(35, 35, 35), Phaser.Geom.Circle.Contains);
        btnBg.on('pointerdown', () => {
            if (!this.scene.isCameraPanning) { btnBg.setScale(0.9); btnIcon.setScale(0.9); }
        });
        btnBg.on('pointerup', () => {
            btnBg.setScale(1); btnIcon.setScale(1);
            if (this.scene.isCameraPanning) return;
            this.scene.isCameraPanning = true;
            this.scene.cameras.main.pan(this.scene.isLookingAtEnemy ? this.screenWidth / 2 : this.screenWidth * 1.5, this.screenHeight / 2, 600, 'Power2');
            this.scene.isLookingAtEnemy = !this.scene.isLookingAtEnemy;
            this.scene.time.delayedCall(600, () => { this.scene.isCameraPanning = false; });
        });
    }

    // --- 2. ACTION MENU ---
    createActionMenu() {
        const centerX = this.screenWidth / 2;
        const baseY = this.screenHeight - 45;

        const bg = this.scene.add.rectangle(centerX, baseY, 260, 80, 0x222222)
            .setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(100);

        this.moveBtnBg = this.scene.add.rectangle(centerX - 65, baseY, 100, 50, 0x2196f3)
            .setInteractive().setScrollFactor(0).setDepth(101);
        const moveTxt = this.scene.add.text(centerX - 65, baseY, "MOVE", { fontSize: '18px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(101);

        this.atkBtnBg = this.scene.add.rectangle(centerX + 65, baseY, 100, 50, 0xf44336)
            .setInteractive().setScrollFactor(0).setDepth(101);
        const atkTxt = this.scene.add.text(centerX + 65, baseY, "ATTACK", { fontSize: '18px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setScrollFactor(0).setDepth(101);

        this.actionMenuElements = [bg, this.moveBtnBg, moveTxt, this.atkBtnBg, atkTxt];
        this.setActionMenuVisible(false);

        // Emit events back to the GameScene instead of handling logic here
        this.moveBtnBg.on('pointerdown', () => {
            this.moveBtnBg.setStrokeStyle(3, 0xffff00);
            this.atkBtnBg.setStrokeStyle(0);
            this.scene.events.emit('ui_action_selected', 'MOVING');
        });

        this.atkBtnBg.on('pointerdown', () => {
            this.atkBtnBg.setStrokeStyle(3, 0xffff00);
            this.moveBtnBg.setStrokeStyle(0);
            this.scene.events.emit('ui_action_selected', 'ATTACKING');
        });
    }

    setActionMenuVisible(isVisible) {
        this.actionMenuElements.forEach(el => el.setVisible(isVisible));
        if (!isVisible) {
            this.moveBtnBg.setStrokeStyle(0);
            this.atkBtnBg.setStrokeStyle(0);
        }
    }

    // --- 3. TURN TRACKER ---
    updateTurnTrackerUI(currentUnit, turnQueue, activeUnits) {
        this.turnTrackerContainer.removeAll(true);
        const displayList = [];
        if (currentUnit) displayList.push(currentUnit);
        displayList.push(...turnQueue);

        const nextRoundOrder = [...activeUnits].filter(unit => !unit.isDead);
        nextRoundOrder.sort((a, b) => b.speed - a.speed);

        while (displayList.length < 5 && nextRoundOrder.length > 0) {
            displayList.push(...nextRoundOrder);
        }

        const showCount = Math.min(displayList.length, 5);
        const boxSize = 50;
        const spacing = 15;
        let startX = -(((showCount * boxSize) + ((showCount - 1) * spacing)) / 2) + (boxSize / 2);

        for (let i = 0; i < showCount; i++) {
            const unit = displayList[i];
            const isCurrentTurn = (i === 0);
            const bgColor = unit.isPlayerUnit ? 0x2196f3 : 0xff9900;

            const box = this.scene.add.rectangle(startX, 0, boxSize, boxSize, bgColor);
            box.setStrokeStyle(isCurrentTurn ? 4 : 2, isCurrentTurn ? 0xffffff : 0x000000);
            const iconText = this.scene.add.text(startX, 0, unit.name.substring(0, 3).toUpperCase(), { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            if (isCurrentTurn) {
                box.setScale(1.2);
                iconText.setScale(1.2);
            }
            this.turnTrackerContainer.add([box, iconText]);
            startX += boxSize + spacing;
        }
    }

    // --- 4. PLACEMENT UI ---
    showPlacementUI(timeLeft, onReadyCallback) {
        this.placementTimerText = this.scene.add.text(this.screenWidth / 2, 50, `SETUP PHASE: ${timeLeft}`, {
            fontSize: '22px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        const readyBg = this.scene.add.rectangle(this.screenWidth / 2, 100, 150, 40, 0x4caf50).setOrigin(0.5).setInteractive();
        const readyTxt = this.scene.add.text(this.screenWidth / 2, 100, "READY", { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.readyContainer = this.scene.add.container(0, 0, [readyBg, readyTxt]).setScrollFactor(0);

        readyBg.on('pointerdown', onReadyCallback);
    }

    updatePlacementTimer(timeLeft) {
        if (this.placementTimerText) this.placementTimerText.setText(`SETUP PHASE: ${timeLeft}`);
    }

    hidePlacementUI() {
        if (this.placementTimerText) this.placementTimerText.destroy();
        if (this.readyContainer) this.readyContainer.destroy();
    }
}
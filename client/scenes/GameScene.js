import Phaser from 'phaser';
import { Board } from '../objects/Board.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isLookingAtEnemy = false;
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // 1. EXPAND THE WORLD FOR SIDE-BY-SIDE BOARDS
        this.cameras.main.setBounds(0, 0, screenWidth * 2, screenHeight);

        // 2. CALCULATE DYNAMIC MOBILE SIZES
        const cellSize = (screenWidth - 40) / 10;
        const gridStartX = 20 + (cellSize / 2);
        const gridStartY = screenHeight * 0.3; // Push it down below the UI

        // 3. CREATE PLAYER BOARD (Left Side)
        this.add.text(screenWidth / 2, 50, "YOUR KINGDOM", { fill: '#fff', fontSize: '24px' }).setOrigin(0.5);
        this.playerBoard = new Board(this, gridStartX, gridStartY, cellSize, false);

        // 4. CREATE ENEMY BOARD (Right Side)
        this.add.text(screenWidth * 1.5, 50, "ENEMY TERRITORY", { fill: '#fff', fontSize: '24px' }).setOrigin(0.5);
        this.enemyBoard = new Board(this, gridStartX + screenWidth, gridStartY, cellSize, true);

        this.gameState = 'PLAYER_TURN'; // Start here for debugging attacks

        // Listen for ANY cell being clicked
        this.events.on('cellClicked', (clickedCell) => {
            this.handleAttack(clickedCell);
        });

        // 5. ADD THE UI
        this.createToggleButton(screenWidth, screenHeight);
    }

    createToggleButton(screenWidth, screenHeight) {
        // Create the background and text directly
        const btnBg = this.add.rectangle(screenWidth / 2, screenHeight * 0.9, 250, 60, 0xffd700).setOrigin(0.5);
        const btnText = this.add.text(screenWidth / 2, screenHeight * 0.9, "SWITCH VIEW", {
            fill: '#000000', fontSize: '20px', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Apply scroll factor 0 directly to the interactive objects so they stick to the screen
        btnBg.setScrollFactor(0);
        btnText.setScrollFactor(0);

        // Make it clickable
        btnBg.setInteractive({ useHandCursor: true });

        // Camera Pan Logic
        btnBg.on('pointerdown', () => {
            btnBg.setScale(0.95);
            btnText.setScale(0.95);
        });

        btnBg.on('pointerup', () => {
            btnBg.setScale(1);
            btnText.setScale(1);

            if (this.isLookingAtEnemy) {
                // Slide back to Player (Center: screenWidth / 2)
                this.cameras.main.pan(screenWidth / 2, screenHeight / 2, 600, 'Power2');
                this.isLookingAtEnemy = false;
            } else {
                // Slide to Enemy (Center: screenWidth * 1.5)
                this.cameras.main.pan(screenWidth * 1.5, screenHeight / 2, 600, 'Power2');
                this.isLookingAtEnemy = true;
            }
        });
    }

    handleAttack(cell) {
        // 1. Validate the turn
        if (this.gameState !== 'PLAYER_TURN' || !cell.isEnemyBoard) {
            console.log("Not your turn, or wrong board!");
            return;
        }

        // 2. Resolve the Player's attack
        cell.isHit = true;
        if (cell.hasUnit) {
            cell.setFillStyle(0xff0000); // Hit
        } else {
            cell.setFillStyle(0x808080); // Miss
        }

        // 3. Switch turn to the Enemy
        this.gameState = 'ENEMY_TURN';
        console.log("Enemy is thinking...");

        // 4. Fake the Enemy's turn after a 1 second delay
        this.time.delayedCall(1000, () => {
            this.fakeEnemyTurn();
        });
    }

    fakeEnemyTurn() {
        // Pick a random row and col on the Player's board
        const randomRow = Phaser.Math.Between(0, 9);
        const randomCol = Phaser.Math.Between(0, 9);

        const targetCell = this.playerBoard.grid[randomRow][randomCol];

        // If it's already hit, try again (simple recursion)
        if (targetCell.isHit) {
            this.fakeEnemyTurn();
            return;
        }

        // Resolve the Enemy's attack
        targetCell.isHit = true;
        targetCell.setFillStyle(0xff9900); // Let's make enemy shots Orange for now

        // Pan the camera back to the Player's board so you can see the attack land!
        this.cameras.main.pan(this.scale.width / 2, this.scale.height / 2, 600, 'Power2');
        this.isLookingAtEnemy = false;

        console.log(`Enemy attacked Row ${randomRow}, Col ${randomCol}`);

        // Give the turn back to the player
        this.gameState = 'PLAYER_TURN';
    }

}
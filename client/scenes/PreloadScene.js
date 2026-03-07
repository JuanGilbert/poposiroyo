import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log('Loading assets & CMS config...');

        // MENGUNDUH DATA DARI SERVER SIMULASI (folder public)
        // Pastikan game-config.json berada di: client/public/game-config.json
        this.load.json('cmsConfig', 'game-config.json');
    }

    create() {
        // AMBIL DATA YANG SUDAH DIUNDUH
        const configData = this.cache.json.get('cmsConfig');

        // --- SISTEM KEAMANAN (ERROR HANDLING) ---
        // Jika file gagal dimuat (configData = undefined), jangan langsung crash!
        if (!configData || !configData.config) {
            console.error('ERROR: game-config.json gagal dimuat! Pastikan file berada di folder client/public/game-config.json');
            console.warn('Menggunakan data Fallback (Cadangan) agar game tetap berjalan...');

            // Data Cadangan Sementara:
            const fallbackConfig = {
                gameplay: { placementTime: 30 },
                characters: {
                    "Assassin": { "name": "Assassin", "tileSize": 1, "hp": 1, "speed": 90, "moveRange": 4, "attackRange": 1, "attackOffsets": [{"r": 0, "c": 0}] },
                    "Mage": { "name": "Mage", "tileSize": 2, "hp": 2, "speed": 50, "moveRange": 2, "attackRange": 3, "attackOffsets": [{"r": 0, "c": 0}, {"r": -1, "c": 0}, {"r": 1, "c": 0}, {"r": 0, "c": -1}, {"r": 0, "c": 1}] },
                    "Paladin": { "name": "Paladin", "tileSize": 3, "hp": 5, "speed": 30, "moveRange": 2, "attackRange": 1, "attackOffsets": [{"r": 0, "c": 0}, {"r": 0, "c": -1}, {"r": 0, "c": 1}] },
                    "Scout": { "name": "Scout", "tileSize": 1, "hp": 2, "speed": 100, "moveRange": 5, "attackRange": 4, "attackOffsets": [{"r": 0, "c": 0}], "revealOffsets": [{"r": 0, "c": 0}, {"r": -1, "c": 0}, {"r": 1, "c": 0}, {"r": 0, "c": -1}, {"r": 0, "c": 1}, {"r": -2, "c": 0}, {"r": 2, "c": 0}, {"r": 0, "c": -2}, {"r": 0, "c": 2}, {"r": -1, "c": -1}, {"r": -1, "c": 1}, {"r": 1, "c": -1}, {"r": 1, "c": 1}] }
                }
            };
            this.registry.set('gameConfig', fallbackConfig);
        } else {
            // SIMPAN KE MEMORI GLOBAL PHASER (Registry) JIKA BERHASIL
            this.registry.set('gameConfig', configData.config);
        }

        console.log('Data CMS berhasil dimuat:', this.registry.get('gameConfig'));

        this.scene.start('MenuScene');
    }
}
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.audio('blip', 'assets/blip.mp3');
        this.load.audio('gameover', 'assets/gameover.mp3');
    }

    create() {
        this.scene.start('MainMenuScene');
    }
}

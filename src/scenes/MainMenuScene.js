export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Start Game', { fontSize: '32px', fill: '#fff' });
        startButton.setOrigin(0.5);
        startButton.setInteractive();

        startButton.on('pointerdown', () => {
            // Resume the audio context
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            this.scene.start('GameScene');
        });
    }
}

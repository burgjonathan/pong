export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
        this.playerScore = 0;
        this.opponentScore = 0;
        this.scoreText = null;
    }

    create() {
        this.scoreText = this.add.text(this.cameras.main.width / 2 - 50, 20, '0 - 0', { fontSize: '32px', fill: '#fff' });

        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('playerScore', () => {
            this.playerScore++;
            this.scoreText.setText(`${this.playerScore} - ${this.opponentScore}`);
        });

        gameScene.events.on('opponentScore', () => {
            this.opponentScore++;
            this.scoreText.setText(`${this.playerScore} - ${this.opponentScore}`);
        });
    }
}

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.opponent = null;
        this.ball = null;
        this.cursors = null;
        this.ballCooldown = false;
        this.leftBorder = null;
        this.rightBorder = null;

        // Music rotation system
        this.musicTracks = [
            'assets/music/cydonian-sky.xm',
            'assets/music/chipsounds.mod',
            'assets/music/mysteristerium.mod',
            'assets/music/rfchip001.xm'
        ];
        this.currentMusicIndex = 0;
    }

    create() {
        // Create paddles
        this.player = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 50, 100, 20, 0xffffff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setImmovable(true);

        this.opponent = this.add.rectangle(this.cameras.main.width / 2, 50, 100, 20, 0xffffff);
        this.physics.add.existing(this.opponent);
        this.opponent.body.setCollideWorldBounds(true);
        this.opponent.body.setImmovable(true);

        // Create ball using the new function
        this.createBall();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Draw borders
        const borderWidth = 10;
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Top border (visual only, ball should pass through for scoring)
        this.add.rectangle(screenWidth / 2, borderWidth / 2, screenWidth, borderWidth, 0xffffff);
        // Bottom border (visual only, ball should pass through for scoring)
        this.add.rectangle(screenWidth / 2, screenHeight - borderWidth / 2, screenWidth, borderWidth, 0xffffff);

        // Left border (make it a physics body)
        this.leftBorder = this.add.rectangle(borderWidth / 2, screenHeight / 2, borderWidth, screenHeight, 0xffffff);
        this.physics.add.existing(this.leftBorder, true); // true for static body

        // Right border (make it a physics body)
        this.rightBorder = this.add.rectangle(screenWidth - borderWidth / 2, screenHeight / 2, borderWidth, screenHeight, 0xffffff);
        this.physics.add.existing(this.rightBorder, true); // true for static body

        this.playNextSong();
    }

    createBall() {
        // Create ball
        this.ball = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 20, 20, 0xffffff);
        this.physics.add.existing(this.ball);
        this.ball.body.setBounce(1, 1);
        this.ball.body.setVelocity(200, 200);

        // Physics interactions
        this.physics.add.collider(this.ball, this.player, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.opponent, this.hitPaddle, null, this);

        // Add colliders for ball with left and right borders (if they exist)
        if (this.leftBorder) {
            this.physics.add.collider(this.ball, this.leftBorder);
        }
        if (this.rightBorder) {
            this.physics.add.collider(this.ball, this.rightBorder);
        }
    }

    update() {
        // Player movement - use mouse/touch position
        const pointer = this.input.activePointer;
        const mouseX = pointer.x;
        const paddleX = this.player.x;

        // Move paddle based on mouse position relative to paddle
        if (mouseX < paddleX - 10) {
            this.player.body.setVelocityX(-300);
        } else if (mouseX > paddleX + 10) {
            this.player.body.setVelocityX(300);
        } else {
            this.player.body.setVelocityX(0);
        }

        // AI movement
        this.updateOpponent();

        // Score update - only check if ball exists
        if (this.ball && this.ball.active) {
            if (this.ball.y > this.cameras.main.height) {
                this.events.emit('opponentScore');
                this.handleScore();
            } else if (this.ball.y < 0) {
                this.events.emit('playerScore');
                this.handleScore();
            }
        }
    }

    handleScore() {
        // Delete the ball
        this.ball.destroy();

        window.pauseChiptune();

        this.sound.play('gameover');
        const gameoverSound = this.sound.get('gameover')

        // Pause the music
        // Wait for the gameover sound to finish before recreating the ball
        gameoverSound.on('complete', () => {
            this.createBall();
            this.playNextSong();
        });
    }

    playNextSong() {
        // Rotate to next song
        this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicTracks.length;
        const nextTrack = this.musicTracks[this.currentMusicIndex];
        window.playChiptune(nextTrack);
    }

    updateOpponent() {
        // Only update opponent AI if ball exists
        if (!this.ball || !this.ball.active) {
            this.opponent.body.setVelocityX(0);
            return;
        }

        const ballX = this.ball.x;
        const opponentX = this.opponent.x;
        const diff = ballX - opponentX;

        if (Math.abs(diff) < 10) {
            return;
        }

        const speed = 200;
        if (diff > 0) {
            this.opponent.body.setVelocityX(speed);
        } else {
            this.opponent.body.setVelocityX(-speed);
        }
    }

    resetBall() {
        this.ball.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
        this.ball.body.setVelocity(200, 200);
    }

    hitPaddle(ball, paddle) {
        if (this.ballCooldown) {
            return;
        }
        this.ballCooldown = true;

        // bring back the ball position to last value
        this.sound.play('blip');
        ball.body.velocity.y *= -1;
        ball.body.velocity.x += Phaser.Math.Between(-20, 20);

        this.time.delayedCall(100, () => {
            this.ballCooldown = false;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#112211", 
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1000, 
            height: 600,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: PlayGame
    };

    const game = new Phaser.Game(gameConfig);
});

class PlayGame extends Phaser.Scene {
    
    constructor() {
        super("PlayScene");
        this.score = 0;
        this.zombieKillCount = 0; 
    }

    preload() {
        this.load.image("background", "assets/ground.png");
        this.load.image("plant", "assets/plant.png");
        this.load.image("pea", "assets/pea.png");
        this.load.image("zombie_1", "assets/zombie1.png");
        this.load.image("zombie_2", "assets/zombie2.png"); 
        this.load.image("star", "assets/star.png"); 
        
    }

    initGameElements() {
        this.lives = 3;
        this.gameWidth = this.game.config.width;
        this.gameHeight = this.game.config.height;

        this.isGameRunning = true;

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.peas = this.physics.add.group();
        this.zombiesBasic = this.physics.add.group();
        this.zombiesConehead = this.physics.add.group(); 
        this.stars = this.physics.add.group(); 

        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: '24px', fill: '#000000', fontStyle: 'bold' });
        this.livesText = this.add.text(16, 40, `Lives: ${this.lives}`, { fontSize: '24px', fill: '#000000', fontStyle: 'bold' });
        
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 50, "Game Over", {
            fontSize: '32px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        
        this.finalScoreText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, "", {
            fontSize: '24px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        
        this.restartHintText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 50, "Press Enter or Space to Restart", {
            fontSize: '20px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
    }

    create() {
        this.initGameElements();
    
        this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.background.setDisplaySize(this.gameWidth, this.gameHeight);
    
        this.plant = this.physics.add.sprite(50, this.gameHeight / 2, 'plant')
            .setOrigin(0.5, 0.5)
            .setCollideWorldBounds(true);
    
        this.initPeas();
        this.spawnZombies();
        this.setupColliders();
    
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: '24px', fill: '#000000', fontStyle: 'bold' });
        this.livesText = this.add.text(16, 40, `Lives: ${this.lives}`, { fontSize: '24px', fill: '#000000', fontStyle: 'bold' });
        
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 50, "Game Over", {
            fontSize: '32px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        
        this.finalScoreText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, "", {
            fontSize: '24px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        
        this.restartHintText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 50, "Press Enter or Space to Restart", {
            fontSize: '20px',
            fill: '#000000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);


    }

    setupColliders() {
        // Zombie 1 Collision Detection
        this.physics.add.overlap(this.peas, this.zombiesBasic, (pea, zombie) => {
            if (pea.active && zombie.active) {
                zombie.setActive(false).setVisible(false);
                pea.setActive(false).setVisible(false);
                this.score += 10; 
                this.scoreText.setText(`Score: ${this.score}`);
                
                this.zombieKillCount++;
                this.checkForStarSpawn();
            }
        });
    
        // Zombie 2 Collision Detection
        this.physics.add.overlap(this.peas, this.zombiesConehead, (pea, zombie) => {
            if (pea.active && zombie.active) {
                zombie.hitCount = (zombie.hitCount || 0) + 1;
                if (zombie.hitCount >= 2) {
                    zombie.setActive(false).setVisible(false);
                    this.score += 20; 
                    this.scoreText.setText(`Score: ${this.score}`);
                    this.zombieKillCount++;
                    this.checkForStarSpawn();
                }
                pea.setActive(false).setVisible(false);
            }
        });
    
        
        this.physics.add.overlap(this.plant, this.stars, (plant, star) => {
            star.disableBody(true, true); 
            this.score += 30; 
            this.scoreText.setText(`Score: ${this.score}`);
        });
    
        this.physics.add.overlap(this.plant, this.zombiesBasic, (plant, zombie) => {
            if (zombie.active) {
                this.lives -= 1;
                this.livesText.setText(`Lives: ${this.lives}`);
                zombie.setActive(false).setVisible(false);
                if (this.lives <= 0) this.endGame();
            }
        });

        this.physics.add.overlap(this.plant, this.zombiesConehead, (plant, zombie) => {
            if (zombie.active) {
                this.lives -= 1;
                this.livesText.setText(`Lives: ${this.lives}`);
                zombie.setActive(false).setVisible(false);
                if (this.lives <= 0) this.endGame();
            }
        });
    
        
    }

    checkForStarSpawn() {
        if (this.zombieKillCount >= 10) {
            this.zombieKillCount = 0; 
            const x = Phaser.Math.Between(100, this.gameWidth - 100);
            const y = Phaser.Math.Between(100, this.gameHeight - 100);
       
            const star = this.stars.get(x, y, 'star').setOrigin(0.5);
            star.setActive(true);
            star.setVisible(true);
            star.enableBody(true, x, y, true, true); 
        }
    }


    endGame() {
        this.physics.pause();
        this.isGameRunning = false;
    
        if (this.zombieTimer) {
            this.zombieTimer.remove(); 
        }
    
        this.plant.setVisible(false);
        this.peas.getChildren().forEach(pea => pea.setVisible(false));
        this.zombiesBasic.getChildren().forEach(zombie => {
            zombie.setVisible(false);  
            zombie.setActive(false);   
        });
        this.zombiesConehead.getChildren().forEach(zombie => {
            zombie.setVisible(false);  
            zombie.setActive(false);   
        });

  
        this.stars.getChildren().forEach(star => {
            star.disableBody(true, true);
        });
    
   
        this.scoreText.setVisible(false);
        this.livesText.setVisible(false);
    
       
        this.gameOverText.setText("Game Over").setAlpha(1).setVisible(true);
        this.finalScoreText.setText(`Final Score: ${this.score}`).setAlpha(1).setVisible(true);
        this.restartHintText.setText("Press Enter or Space to Restart").setAlpha(1).setVisible(true);
    
    
        this.input.keyboard.once('keydown-ENTER', this.resetGame, this);
        this.input.keyboard.once('keydown-SPACE', this.resetGame, this);
    }
    
    resetGame() {
        this.peas.getChildren().forEach(item => this.peas.killAndHide(item));
        this.zombiesBasic.getChildren().forEach(item => this.zombiesBasic.killAndHide(item));
        this.zombiesConehead.getChildren().forEach(item => this.zombiesConehead.killAndHide(item));
        
        this.plant.setPosition(50, this.gameHeight / 2).setVisible(true);
        this.isGameRunning = true;
        this.physics.resume();
        this.cameras.main.setBackgroundColor('#112211');
        
        this.score = 0;
        this.scoreText.setText(`Score: ${this.score}`).setVisible(true);
        this.lives = 3;
        this.livesText.setText(`Lives: ${this.lives}`).setVisible(true);
        
     
        this.gameOverText.setAlpha(0);
        this.finalScoreText.setAlpha(0);
        this.restartHintText.setAlpha(0);
        
       
        this.spawnZombies();
    }

   

    spawnZombies() {
        this.zombieTimer = this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (!this.isGameRunning) return;
                const y = Phaser.Math.Between(this.plant.height, this.gameHeight - this.plant.height);
                const zombieType = Phaser.Math.Between(1, 2);
                if (zombieType === 1) {
                    const zombie1 = this.zombiesBasic.get(this.gameWidth + this.plant.width, y, 'zombie_1')
                        .setOrigin(1, 0);
                    zombie1.setTexture('zombie_1');
                    zombie1.setVelocityX(-220);
                    zombie1.setActive(true);
                    zombie1.setVisible(true);
                } else {
                    const zombie2 = this.zombiesConehead.get(this.gameWidth + this.plant.width, y, 'zombie_2')
                        .setOrigin(1, 0);
                    zombie2.setTexture('zombie_2');
                    zombie2.setVelocityX(-180);
                    zombie2.setActive(true);
                    zombie2.setVisible(true);
                    zombie2.hitCount = 0; 
                }
            }
        });
    }

    initPeas() {
        this.time.addEvent({
            delay: 260,
            loop: true,
            callback: () => {
                if (!this.isGameRunning) return;
                const pea = this.peas.get(this.plant.x + 50, this.plant.y, 'pea');
                pea.setVelocityX(500); 
                pea.setActive(true);
                pea.setVisible(true);
            }
        });
    }

    update() {
       
        if (this.cursorKeys.up.isDown) {
            this.plant.setVelocityY(-260);
        } else if (this.cursorKeys.down.isDown) {
            this.plant.setVelocityY(260); 
        } else {
            this.plant.setVelocityY(0);
        }
        

        if (this.cursorKeys.left.isDown) {
            this.plant.setVelocityX(-260); 
        } else if (this.cursorKeys.right.isDown) {
            this.plant.setVelocityX(260); 
        } else {
            this.plant.setVelocityX(0);
        }
    
        this.peas.getChildren().forEach(pea => {
            if (pea.active && pea.x > this.gameWidth) {
                this.peas.killAndHide(pea); 
            }
        });
    
   
        this.zombiesBasic.getChildren().forEach(zombie => {
            if (zombie.active && zombie.x < 0) {
                this.zombiesBasic.killAndHide(zombie); 
            }
        });
    
        this.zombiesConehead.getChildren().forEach(zombie => {
            if (zombie.active && zombie.x < 0) {
                this.zombiesConehead.killAndHide(zombie); 
            }
        });
    }
}

    
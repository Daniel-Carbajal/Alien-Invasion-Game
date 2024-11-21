//image variables for sprites and background
let alienSprite;
let spaceShipSprite;
let chicago;

//sound variables
let alienSound;
let shipSound;
let bulletSound;

//loads in all images and sound
//aliens, background, spaceship
function preload() {
  alienSprite = loadImage('images/alien.PNG');
  chicago = loadImage('images/chicago.jpg');
  spaceShipSprite = loadImage('images/spaceship.png');
  
  soundFormats('wav', 'ogg');
  alienSound = loadSound('sounds/death.ogg');
  shipSound = loadSound('sounds/ship.wav');
  bulletSound = loadSound('sounds/shoot.ogg');
}

//creates bullets using position (of ship)
class Bullet {
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
  //moves instance of bullet forward
  shoot() {
    this.posY -= 5;
  }
  //when bullet is off screen it is deleted from the bullets array
  disappear() {
    let index = bullets.indexOf(this);
    bullets.splice(index, 1);
  }
}

//Creates asteroids using size and positions
class Alien {
  constructor(posX, posY, size) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.hp = 5;
    if (this.size > 40) {
      this.speed = 1;
    } else if (this.size > 30) {
      this.speed = 3;
    } else if (this.size >= 20) {
      this.speed = 5;
    }
  }

  //deals damage to either the player or the alien instance
  takeDamage() {
    for (let i = 0; i < bullets.length; i++) {
      //if any bullets hit this alien
      if (
        dist(bullets[i].posX, bullets[i].posY, this.posX, this.posY) <=
        this.size / 2
      ) {
        //the alien looses health & the bullet disappears
        this.hp = this.hp - 1;
        bullets[i].disappear();
      }
    }
  }

  //alien dies
  kill() {
    let index = aliens.indexOf(this);

    //if the aliens hp reaches 0 it dies and the player gets 50 points
    if (this.hp <= 0) {
      if(this.posY > height/2){
        score+=100;
      } else {
      score += 50;
      }
      
      aliens.splice(index, 1);
      alienSound.play();
    }
    //if the ship touches this alien the alien dies and the player loses a life
    else if (dist(shipX, height - 50, this.posX, this.posY) <= this.size / 2) {
      aliens.splice(index, 1);
      lives -= 1;
      shipSound.play();
    }
    //this alien dies if it goes out of bounds
    else if (
      this.posX < 0 ||
      this.posY < 0 ||
      this.posX > width ||
      this.posY > height
    ) {
      aliens.splice(index, 1);
    }
  }

  //removes aliens from list to restart the game
  reset() {
    let index = aliens.indexOf(this);
    aliens.splice(index, 1);
  }

  //changes positions vars based on speed
  move() {
    let speed = this.speed;
    this.posX = this.posX + random(-3, 3) * this.speed;
    this.posY = this.posY + random(-3, 3) * this.speed;
  }
}

//Variables
//Stores instances of the bullet class
let bullets = [];

//Stores instances of the asteroid class
let aliens = [];

//stores buttons
let pauseButton;

//Tells if game is paused or not
let isGamePaused = false;

//stores players score
let score = 0;
let highScore = 0;

//number of lives left
let lives = 3;
//wave of game should increase every 10 seconds
let wave = 1;

//stores x pos of spaceship
let shipX;

//determines the stage of the game. stage 1 is the start screen, 2 is playing, 3 is game over
let gameStage = 1;

function setup() {
  createCanvas(600, 500);
  textSize(20);
  //creates pause button at top left of canvas
  pauseButton = createButton("Pause");
  pauseButton.position(width - 70, 0);
  //when pause button is clicked, run the pauseGame function
  pauseButton.mousePressed(pauseGame);

  //puts ship in the middle of the screen
  shipX = width / 2;

  //30 frames per second
  frameRate(30);

  rectMode(CENTER);
  imageMode(CENTER);
  textStyle(BOLD);
}

function draw() {
  image(chicago,width/2,height/2,width,height);
  if (gameStage == 1) {
    runStage1();
  } else if (gameStage == 2) {
    runStage2();
  } else if (gameStage == 3) {
    runStage3();
  }
}

//Creates spaceship at x position of mouse
//in stage 2
function createShip() {
  image(spaceShipSprite,shipX, height - 50, 30,30);
  moveShip();
}

//uses arrow keys to move ship left and right
//in createShip
function moveShip() {
  if (keyIsDown(LEFT_ARROW)) {
    shipX -= 5;
  }

  if (keyIsDown(RIGHT_ARROW)) {
    shipX += 5;
  }
}

//Moves bullets forward once they are created and delets them if they are off screen
//in stage 2
function moveBullets() {
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].posY >= 0) {
      circle(bullets[i].posX, bullets[i].posY, 5);
      bullets[i].shoot();
    } else if (bullets[i].posY < 0) {
      bullets[i].disappear();
    }
  }
}

//updates and displays player score
//in stage 2
function displayScore() {
  fill("black");
  text("Score: " + score + "   Lives: " + lives, 5, 20);
}

//ends game (sets gameStage = 3) when player runs out of lives
//in stage 2
function endsGame() {
  if (lives <= 0) {
    gameStage = 3;
  }
  if (score > highScore) {
    highScore = score;
  }
}

//Creates a random amount of aliens as the game progresses
//every 10 seconds the wave increases
function createAliens() {
  if (frameCount % 150 == 0) {
    if (wave <= 10) {
      wave += 1;
    }
    for (let i = 0; i <= wave; i++) {
      if (aliens.length <= 25) {
        aliens.push(
          new Alien(random(0, width), random(0, height - 100), random(20, 50))
        );
      }
    }
  }
}

//Constantly runs the move function for every instance of alien
function updateAliens() {
  for (let i = 0; i < aliens.length; i++) {
    push();
    fill("green");
    image(alienSprite,aliens[i].posX, aliens[i].posY, aliens[i].size,aliens[i].size);
    pop();
    text(aliens[i].hp, aliens[i].posX, aliens[i].posY - aliens[i].size);

    aliens[i].takeDamage();
    aliens[i].move();
    aliens[i].kill();
  }
}

//runs the start screen where
function runStage1() {
  push();
  fill("black");
  textAlign(CENTER);
  text("High Score: " + highScore, 100, 50);
  text("Press ENTER to start game", width / 2, height / 2);
  pop();
  if (keyCode == ENTER) {
    gameStage = 2;
  }
  score = 0;
}

//updates everything in the gameplay part of the game
function runStage2() {
  createShip();
  displayScore();
  moveBullets();
  createAliens();
  updateAliens();
  endsGame();
}

//game over screen and shows score
function runStage3() {
  push();
  textAlign(CENTER);
  text("GAME OVER! You Saved " + score + " People!", width / 2, height / 2);
  text("Press 'Pause' to restart", width / 2, height / 2 + 30);
  pop();

  //resets game in back ground
  lives = 3;
  wave = 1;
  shipX = width / 2;
  for (let i = 0; i < aliens.length; i++) {
    aliens[i].reset();
  }
}

//Creates a bullet if up arrow is clicked
function keyPressed() {
  if (keyCode == UP_ARROW) {
    bullets.push(new Bullet(shipX, height - 50));
    bulletSound.play();
  }
  if (gameStage == 1) {
    runStage1();
  }
}

//toggles pause button to pause or unpause game (stops or continues loop)
function pauseGame() {
  //also can be used to restart game on game over screen
  if (gameStage == 3) {
    gameStage = 1;
  } else if (isGamePaused == false) {
    noLoop();
    isGamePaused = true;
    pauseButton.html("Unpause");
  } else {
    loop();
    isGamePaused = false;
    pauseButton.html("Pause");
  }
}
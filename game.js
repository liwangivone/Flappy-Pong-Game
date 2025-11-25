// Variabel Global
// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen

let ballX, ballY;        
let ballSize = 20;         
let ballColor;  
let gravity = 1;         
let ballSpeedVert = 0;   
let airFriction = 0.0001; 
let friction = 0.1;      

let racketColor; 
let racketWidth = 100; 
let racketHeight = 10; 
let racketBounceRate = 20; 

let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;

// wallColors tidak dipakai lagi (warna per-wall disimpan dalam array)
let walls = []; // each wall: [x, y, width, height, scoredFlag, color]

let score = 0;
let wallRadius = 50;

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let ballSpeedHorizon = 10;

let gameScreen = 0;

function setup() {
  createCanvas(500, 500);
  ballColor = color(0, 0, 255);
  racketColor = color(0);

  ballX = width/4;  
  ballY = height/5; 
  lastAddTime = millis();
}

function draw() {
  if (gameScreen == 0) {
    initScreen();
  } else if (gameScreen == 1) {
    gameScreenFunc();
  } else if (gameScreen == 2) {
    gameOverScreen();
  }
}

function gameOver() {
  gameScreen = 2;
}

// SCREEN CONTENTS
function initScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  text("Klik untuk memulai", width/2, height/2);
}

function gameScreenFunc() {
  background(255);
  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

// INPUTS
function mousePressed() {
  if (gameScreen == 0) {
    startGame();
  } else if (gameScreen == 2) {
    restart();
  }
}

function startGame() {
  gameScreen = 1;
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width/4;
  ballY = height/5;
  lastAddTime = millis();
  walls = [];
  gameScreen = 0;
}

// BALL
function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= (ballSpeedVert * airFriction);
}

function makeBounceBottom(surface) {
  ballY = surface - (ballSize / 2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

function makeBounceTop(surface) {
  ballY = surface + (ballSize / 2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

function keepInScreen() {
  if (ballY + (ballSize / 2) > height) {
    makeBounceBottom(height);
  }
  
  if (ballY - (ballSize / 2) < 0) {
    makeBounceTop(0);
  }
  
  if (ballX - (ballSize / 2) < 0) {
    makeBounceLeft(0);
  }
  
  if (ballX + (ballSize / 2) > width) {
    makeBounceRight(width);
  }
}

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;
  if ((ballX + (ballSize / 2) > mouseX - (racketWidth / 2)) && 
      (ballX - (ballSize / 2) < mouseX + (racketWidth / 2))) {
    if (dist(ballX, ballY, ballX, mouseY) <= (ballSize / 2) + abs(overhead)) {
      makeBounceBottom(mouseY);

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
      ballSpeedHorizon = (ballX - mouseX) / 5;
    }
  }
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= (ballSpeedHorizon * airFriction);
}

function makeBounceLeft(surface) {
  ballX = surface + (ballSize / 2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

function makeBounceRight(surface) {
  ballX = surface - (ballSize / 2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

// WALL GENERATION (PERBAIKAN DI BAGIAN INI)
function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let randHeight = round(random(minGapHeight, maxGapHeight));
    let randY = round(random(0, height - randHeight));

    let randColor = color(
      random(100, 255),
      random(100, 255),
      random(100, 255)
    );

    // (x, y, width, height, scoredFlag, color)
    let randWall = [width, randY, wallWidth, randHeight, 0, randColor];
    walls.push(randWall);
    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}

function wallDrawer(index) {
  let wall = walls[index];

  let gapWallX = wall[0];
  let gapWallY = wall[1];
  let gapWallWidth = wall[2];
  let gapWallHeight = wall[3];

  rectMode(CORNER);
  fill(wall[5]); // warna random per-wall

  rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, wallRadius, wallRadius);
  rect(
    gapWallX,
    gapWallY + gapWallHeight,
    gapWallWidth,
    height - (gapWallY + gapWallHeight),
    wallRadius, wallRadius, 0, 0
  );
}

function wallMover(index) {
  walls[index][0] -= wallSpeed;
}

function wallRemover(index) {
  let wall = walls[index];
  if (wall[0] + wall[2] <= 0) {
    walls.splice(index, 1);
  }
}

function watchWallCollision(index) {
  let wall = walls[index];

  let gapWallX = wall[0];
  let gapWallY = wall[1];
  let gapWallWidth = wall[2];
  let gapWallHeight = wall[3];
  let wallScored = wall[4];

  let wallTopX = gapWallX;
  let wallTopY = 0;
  let wallTopWidth = gapWallWidth;
  let wallTopHeight = gapWallY;

  let wallBottomX = gapWallX;
  let wallBottomY = gapWallY + gapWallHeight;
  let wallBottomWidth = gapWallWidth;
  let wallBottomHeight = height - (gapWallY + gapWallHeight);

  if (
    (ballX + (ballSize/2) > wallTopX) &&
    (ballX - (ballSize/2) < wallTopX + wallTopWidth) &&
    (ballY + (ballSize/2) > wallTopY) &&
    (ballY - (ballSize/2) < wallTopY + wallTopHeight)
  ) {
    decreaseHealth();
  }

  if (
    (ballX + (ballSize/2) > wallBottomX) &&
    (ballX - (ballSize/2) < wallBottomX + wallBottomWidth) &&
    (ballY + (ballSize/2) > wallBottomY) &&
    (ballY - (ballSize/2) < wallBottomY + wallBottomHeight)
  ) {
    decreaseHealth();
  }

  if (ballX > gapWallX + (gapWallWidth/2) && wallScored == 0) {
    wall[4] = 1;
    incrementScore();
  }
}

// HEALTH BAR
function drawHealthBar() {
  noStroke();
  fill(236, 240, 241);
  rectMode(CORNER);
  rect(ballX - (healthBarWidth/2), ballY - 30, healthBarWidth, 5);

  if (health > 60) {
    fill(46, 204, 113);
  } else if (health > 30) {
    fill(230, 126, 34);
  } else {
    fill(231, 76, 60);
  }

  rect(
    ballX - (healthBarWidth/2),
    ballY - 30,
    healthBarWidth * (health/maxHealth),
    5
  );
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    gameOver();
  }
}

// GAME OVER
function gameOverScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(30);
  text("Game Over", width/2, height/2 - 20);
  textSize(15);
  text("Click to Restart", width/2, height/2 + 10);
  printScore();
}

// SCORE
function incrementScore() {
  score++;
}

function printScore() {
  textAlign(CENTER);
  if (gameScreen == 1) {
    fill(0);
    textSize(30);
    text(score, width/2, height/2 - 100);
  } else if (gameScreen == 2) {
    fill(255);
    textSize(30);
    text("Score: " + score, width/2, height/2 + 80);
  }
}

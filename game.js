// Variabel Global
// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen

let ballX, ballY;        // Koordinat bola di sumbu x dan y
let ballSize = 20;         // Ukuran bola
let ballColor;  // Warna bola
let gravity = 1;         // Nilai gravitasi awal
let ballSpeedVert = 0;   // Kecepatan bola di sumbu vertikal
let airFriction = 0.0001; // Gesekan yang terjadi di udara
let friction = 0.1;      // Gesekan yang terjadi di permukaan

let racketColor; // Atur warna raket
let racketWidth = 100; // Atur lebar raket
let racketHeight = 10; // Atur tinggi raket
let racketBounceRate = 20; // Atur rate pantulan raket

let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallColors;
// Daftar array ini menyimpan data celah antara dinding.
// (gapWallX, gapWallY, gapWallWidth, gapWallHeight]
let walls = []; // each wall: [gapWallX, gapWallY, gapWallWidth, gapWallHeight, scoredFlag]
let score = 0;
let wallRadius = 50;

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let ballSpeedHorizon = 10; // Bisa mulai dengan 0, tapi untuk test kita beri nilai 10

let gameScreen = 0;

function setup() {
  createCanvas(500, 500);
  ballColor = color(0, 0, 255);
  racketColor = color(0);
  wallColors = color(255, 105, 180);
  ballX = width/4;  // Mengatur posisi bola di sumbu x
  ballY = height/5; // Mengatur posisi bola di sumbu y
  lastAddTime = millis();
}

// Tampilkan konten dari layar yang aktif
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
  applyGravity(); // Memanggil metode implementasi gravitasi
  keepInScreen(); // Memanggil metode menjaga bola tetap di layar
  drawRacket(); // Memanggil metode menggambar raket
  watchRacketBounce(); // Memanggil metode melihat bola memantul raket
  applyHorizontalSpeed(); // Memanggil metode yang mengontrol kecepatan bola
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

// INPUTS
function mousePressed() {
  // Jika pemain mengklik layar awal maka game dimulai
  if (gameScreen == 0) {
    startGame();
  } else if (gameScreen == 2) {
    restart();
  }
}

// Metode ini mengatur variabel-variabel yang diperlukan untuk memulai game
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

function drawBall() {
  fill(ballColor);                            // Memberikan warna pada bola
  ellipse(ballX, ballY, ballSize, ballSize);  // Membuat bola
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

// Menjaga bola tetap berada di layar
function keepInScreen() {
  // Jika bola menabrak bagian bawah layar
  if (ballY + (ballSize / 2) > height) {
    makeBounceBottom(height);
  }
  
  // Jika bola menabrak bagian atas layar
  if (ballY - (ballSize / 2) < 0) {
    makeBounceTop(0);
  }
  
  // Jika bola menabrak bagian kiri layar
  if (ballX - (ballSize / 2) < 0) {
    makeBounceLeft(0);
  }
  
  // Jika bola menabrak bagian kanan layar
  if (ballX + (ballSize / 2) > width) {
    makeBounceRight(width);
  }
}

function drawRacket() {
  fill(racketColor); // Mengisi warna raket
  rectMode(CENTER); // Mengatur perataan raket
  rect(mouseX, mouseY, racketWidth, racketHeight); // Mengatur posisi kotak berdasarkan posisi mouse
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;
  if ((ballX + (ballSize / 2) > mouseX - (racketWidth / 2)) && (ballX - (ballSize / 2) < mouseX + (racketWidth / 2))) {
    if (dist(ballX, ballY, ballX, mouseY) <= (ballSize / 2) + abs(overhead)) {
      makeBounceBottom(mouseY);
      // Raket gerak naik
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

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let randHeight = round(random(minGapHeight, maxGapHeight));
    let randY = round(random(0, height - randHeight));
    
    // (gapWallX, gapWallY, gapWallWidth, gapWallHeight)
    let randWall = [width, randY, wallWidth, randHeight, 0];
    walls.push(randWall);
    lastAddTime = millis();
  }
}

function wallHandler() {
  // iterate backwards to allow safe removal
  for (let i = walls.length - 1; i >= 0; i--) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}

function wallDrawer(index) {
  let wall = walls[index];
  // get gap wall settings
  let gapWallX = wall[0];
  let gapWallY = wall[1];
  let gapWallWidth = wall[2];
  let gapWallHeight = wall[3];
  // draw actual walls
  rectMode(CORNER);
  fill(wallColors);
  // top wall with rounded bottom-right/left corners
  rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, wallRadius, wallRadius);
  // bottom wall with rounded top-left/top-right corners
  rect(gapWallX, gapWallY + gapWallHeight, gapWallWidth, height - (gapWallY + gapWallHeight), wallRadius, wallRadius, 0, 0);
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
  // get gap wall settings
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

function drawHealthBar() {
  noStroke(); // Tanpa Border
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
  rectMode(CORNER);
  rect(ballX - (healthBarWidth/2), ballY - 30, healthBarWidth * (health/maxHealth), 5);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    gameOver();
  }
}

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
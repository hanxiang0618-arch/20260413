let mineCol, mineRow;
let isGameOver = false;
let gameStarted = false;
let startTime;
let elapsedTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function initGame() {
  // 隨機決定地雷的位置 (0 到 11 的整數)
  mineCol = floor(random(12));
  mineRow = floor(random(12));
  isGameOver = false;
  startTime = millis();
}

function draw() {
  background(0); // 黑色背景
  
  drawGrid();

  if (!gameStarted) {
    drawRules();
    return;
  }

  if (!isGameOver) {
    elapsedTime = (millis() - startTime) / 1000;
    drawRadarBall();
  }

  // 繪製計時器
  drawTimer();

  if (isGameOver) {
    fill(0, 255, 0); // 綠色文字
    textSize(64);
    textAlign(CENTER, CENTER);
    text("你贏了！", width / 2, height / 2);
    
    textSize(24);
    fill(200);
    text("按下 [空白鍵] 重新開始", width / 2, height / 2 + 80);
  }
}

function drawGrid() {
  stroke(100); // 灰色線條
  strokeWeight(1);
  
  let colStep = width / 12;
  let rowStep = height / 12;
  
  // 畫垂直線
  for (let i = 0; i <= 12; i++) {
    line(i * colStep, 0, i * colStep, height);
  }
  
  // 畫水平線
  for (let j = 0; j <= 12; j++) {
    line(0, j * rowStep, width, j * rowStep);
  }
}

function drawRules() {
  // 半透明深色背景
  fill(0, 200);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(42);
  text("雷達找地雷：12x12 挑戰", width / 2, height / 2 - 180);

  textSize(22);
  textAlign(LEFT, CENTER);
  let startY = height / 2 - 80;
  let spacing = 35;
  let xPos = width / 2 - 140;

  text("• 移動滑鼠探測地雷距離", xPos, startY);
  text("• 圓球顏色與大小代表接近程度：", xPos, startY + spacing);
  
  fill("#DC143C"); text("● 深紅 (最大)：地雷就在這！", xPos + 20, startY + spacing * 2.5);
  fill("#FF8040"); text("● 橘色：非常接近 (1格內)", xPos + 20, startY + spacing * 3.5);
  fill("#F9F900"); text("● 黃色：警告訊號 (3格內)", xPos + 20, startY + spacing * 4.5);
  fill("#00EC00"); text("● 綠色：發現微弱訊號 (5格內)", xPos + 20, startY + spacing * 5.5);
  fill("#4A4AFF"); text("● 藍色 (最小)：距離尚遠", xPos + 20, startY + spacing * 6.5);

  fill(255);
  textAlign(CENTER, CENTER);
  text("點擊螢幕任何地方開始探測...", width / 2, height / 2 + 220);
}

function drawTimer() {
  fill(255);
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP);
  text("時間：" + elapsedTime.toFixed(2) + " 秒", width / 2, 20);
}

function drawRadarBall() {
  let colStep = width / 12;
  let rowStep = height / 12;
  
  // 取得目前鼠標所在的格子座標
  let hoverCol = floor(mouseX / colStep);
  let hoverRow = floor(mouseY / rowStep);

  // 確保鼠標在畫布範圍內
  if (hoverCol >= 0 && hoverCol < 12 && hoverRow >= 0 && hoverRow < 12) {
    // 計算與地雷的格子距離 (使用切比雪夫距離：Max(dx, dy))
    let dx = abs(hoverCol - mineCol);
    let dy = abs(hoverRow - mineRow);
    let d = max(dx, dy);

    let ballColor = "#4A4AFF"; // 預設藍色
    let sizeMult = 0.2;        // 預設大小比例

    if (d === 0) { ballColor = "#DC143C"; sizeMult = 0.8; }      // 地雷：紅色 (最大)
    else if (d <= 1) { ballColor = "#FF8040"; sizeMult = 0.6; }  // 1格：橘色
    else if (d <= 3) { ballColor = "#F9F900"; sizeMult = 0.45; } // 3格：黃色
    else if (d <= 5) { ballColor = "#00EC00"; sizeMult = 0.3; }  // 5格：綠色
    else { ballColor = "#4A4AFF"; sizeMult = 0.2; }             // 更遠：藍色 (最小)

    // 繪製圓球
    fill(ballColor);
    noStroke();
    let centerX = hoverCol * colStep + colStep / 2;
    let centerY = hoverRow * rowStep + rowStep / 2;
    ellipse(centerX, centerY, min(colStep, rowStep) * sizeMult);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // 如果遊戲還沒開始，點擊後初始化遊戲
  if (!gameStarted) {
    gameStarted = true;
    initGame();
    return;
  }

  if (isGameOver) return;

  let colStep = width / 12;
  let rowStep = height / 12;

  // 計算點擊的是哪一格
  let clickedCol = floor(mouseX / colStep);
  let clickedRow = floor(mouseY / rowStep);

  // 檢查是否點中地雷
  if (clickedCol === mineCol && clickedRow === mineRow) {
    isGameOver = true;
  }
}

function keyPressed() {
  // 當遊戲結束且按下空白鍵 (Key Code 32) 時重新開始
  if (isGameOver && key === ' ') {
    initGame();
  }
}

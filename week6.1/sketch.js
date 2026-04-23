let gameState = "WAITING"; // WAITING, PLAYING, GAMEOVER, WIN
let pathPoints = [];
let currentLevel = 1; // 目前關卡
let lives = 3; // 生命值
const PATH_WIDTH = 75; // 2公分換算像素約為 75px
let fireworks = []; // 煙火粒子
let shocks = [];    // 觸電特效粒子

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // 確保不同螢幕像素比一致
  initPath();
  textAlign(CENTER, CENTER);
  textSize(24);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPath();
  gameState = "WAITING"; // 視窗大小改變時重置
}

function initPath() {
  pathPoints = [];
  let numPoints = 40; // 產生 40 個點 (30-50 之間)
  let centerY = height / 2;
  let range;

  // 根據關卡設定路徑垂直範圍
  if (currentLevel === 1) {
    range = height / 8; // 總範圍 1/4 (上下各 1/8)
  } else if (currentLevel === 2) {
    range = height / 6; // 總範圍 1/3 (上下各 1/6)
  } else {
    range = height / 4; // 總範圍 1/2 (上下各 1/4)
  }

  for (let i = 0; i < numPoints; i++) {
    let x = map(i, 0, numPoints - 1, 50, width - 50);
    // 讓 y 值在中間 1/4 範圍內隨機曲折
    let y = centerY + random(-range, range);
    pathPoints.push({ x: x, y: y });
  }
}

function draw() {
  background(0); // 全螢幕黑色為「危險區域」

  if (gameState === "WAITING" || gameState === "PLAYING") {
    // 繪製灰色蜿蜒路徑 (安全區域)
    noFill();
    stroke(100); // 灰色路徑
    strokeWeight(PATH_WIDTH); 
    strokeJoin(ROUND);
    strokeCap(ROUND);
    
    beginShape();
    if (pathPoints.length > 0) {
      curveVertex(pathPoints[0].x, pathPoints[0].y);
      for (let p of pathPoints) {
        curveVertex(p.x, p.y);
      }
      curveVertex(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
    }
    endShape();

    // 繪製起點與終點
    noStroke();
    fill(0, 255, 0); // 綠色起點
    ellipse(pathPoints[0].x, pathPoints[0].y, 40);
    fill(255, 0, 0); // 紅色終點
    ellipse(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y, 40);

    // 繪製左上角關卡與生命值標示
    fill(255);
    textAlign(LEFT, TOP);
    let heartStr = "";
    for (let i = 0; i < lives; i++) heartStr += "❤️ ";
    text("Level: " + currentLevel + "  生命: " + heartStr, 20, 20);
    
    textAlign(CENTER, CENTER); // 恢復預設對齊
  }

  if (gameState === "WAITING") {
    // 繪製綠色圓圈 Start 按鈕
    fill(0, 255, 0);
    ellipse(pathPoints[0].x, pathPoints[0].y, 60); 
    fill(0);
    textSize(16);
    text("start", pathPoints[0].x, pathPoints[0].y);
    textSize(24);
    
    fill(255);
    text("點擊綠色按鈕開始遊戲", width / 2, height * 0.9);

  } else if (gameState === "PLAYING") {
    // 碰撞檢查：取得滑鼠位置的顏色
    let currentColor = get(mouseX, mouseY);
    // 如果碰到純黑色背景 (0, 0, 0) 則輸掉
    if (currentColor[0] === 0 && currentColor[1] === 0 && currentColor[2] === 0) {
      createShock(mouseX, mouseY); // 產生觸電特效
      lives--;
      if (lives <= 0) {
        gameState = "GAMEOVER";
      } else {
        gameState = "WAITING"; // 扣血後回到該關卡起點
      }
    }

    // 檢查是否到達終點
    if (dist(mouseX, mouseY, pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y) < 20) {
      if (currentLevel < 3) {
        // 進入下一關
        currentLevel++;
        initPath();
        gameState = "WAITING";
      } else {
        gameState = "WIN";
      }
    }

    // 繪製玩家指標
    fill(255, 255, 0);
    noStroke();
    
    // 根據關卡設計點的大小
    let playerSize;
    if (currentLevel === 1) {
      playerSize = PATH_WIDTH / 4; // 第一關：1/4
    } else if (currentLevel === 2) {
      playerSize = PATH_WIDTH / 3; // 第二關：1/3
    } else {
      playerSize = PATH_WIDTH / 2; // 第三關：1/2
    }
    ellipse(mouseX, mouseY, playerSize);

  } else if (gameState === "GAMEOVER") {
    background(0); // 確保畫面全黑
    fill(255, 0, 0);
    textSize(48);
    text("GAME OVER", width / 2, height / 2);
    fill(255);
    textSize(20);
    text("按下 [空白鍵] 重新挑戰", width / 2, height / 2 + 60);
  } else if (gameState === "WIN") {
    background(0);
    
    // 在過關畫面施放煙火
    if (frameCount % 20 === 0) {
      createFirework(random(width), random(height/2, height));
    }

    fill(50, 255, 50);
    textSize(48);
    text("YOU WIN!", width / 2, height / 2);
    fill(255);
    textSize(20);
    text("按下 [空白鍵] 返回首頁", width / 2, height / 2 + 60);
  }

  // 繪製與更新所有特效
  handleEffects();
}

function createShock(x, y) {
  for (let i = 0; i < 8; i++) {
    shocks.push({
      x: x, y: y,
      angle: random(TWO_PI),
      len: random(20, 50),
      life: 255
    });
  }
}

function createFirework(x, y) {
  let col = color(random(255), random(255), random(255));
  for (let i = 0; i < 50; i++) {
    fireworks.push({
      x: x, y: y,
      vx: random(-3, 3),
      vy: random(-6, 2),
      alpha: 255,
      color: col
    });
  }
}

function handleEffects() {
  // 處理觸電特效 (藍白閃電線條)
  strokeWeight(2);
  for (let i = shocks.length - 1; i >= 0; i--) {
    let s = shocks[i];
    stroke(100, 200, 255, s.life);
    line(s.x, s.y, s.x + cos(s.angle) * s.len, s.y + sin(s.angle) * s.len);
    s.life -= 15;
    if (s.life <= 0) shocks.splice(i, 1);
  }

  // 處理煙火粒子
  noStroke();
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let f = fireworks[i];
    fill(red(f.color), green(f.color), blue(f.color), f.alpha);
    ellipse(f.x, f.y, 4);
    f.x += f.vx; f.y += f.vy;
    f.vy += 0.15; // 重力
    f.alpha -= 5;
    if (f.alpha <= 0) fireworks.splice(i, 1);
  }
}

function mousePressed() {
  // 只有在等待狀態點擊綠色按鈕才會開始
  if (gameState === "WAITING") {
    let d = dist(mouseX, mouseY, pathPoints[0].x, pathPoints[0].y);
    if (d < 30) {
      gameState = "PLAYING";
    }
  }
}

function keyPressed() {
  // 按下空白鍵重置遊戲 (keyCode 32 是空白鍵)
  if ((gameState === "GAMEOVER" || gameState === "WIN") && key === ' ') {
    // 重新開始時重置關卡與生命
    currentLevel = 1;
    lives = 3;
    fireworks = []; // 清空特效
    shocks = [];
    initPath();
    gameState = "WAITING";
  }
}

let gameState = "START_SCREEN"; // START_SCREEN, WAITING, PLAYING, DEATH_ANIMATION, GAMEOVER, WIN
let pathPoints = [];
let currentLevel = 1; // 目前關卡
let lives = 3; // 生命值
let pathWidth = 60; // 固定路徑寬度
const PLAYER_SIZE = 35; // 玩家球的固定大小
let obstacles = []; // 障礙物陣列
let fireworks = []; // 煙火粒子
let skullTimer = 0; // 骷髏圖示計時器
let playerX = 0; // 玩家球的實際 X 位置
let playerY = 0; // 玩家球的實際 Y 位置
let gameStartTime = 0;
let gameEndTime = 0; // 紀錄結束時間

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // 確保不同螢幕像素比一致
  initPath();
  textAlign(CENTER, CENTER);
  textSize(24);
  gameStartTime = millis(); // 紀錄開始時間
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPath();
  gameState = "WAITING"; // 視窗大小改變時重置
}

function initPath() {
  pathPoints = [];
  let numPoints = 30;
  let centerY = height / 2;
  // 根據關卡設定路徑波動幅度與雜訊密度（密度越高路徑越蜿蜒）
  let amplitude = map(currentLevel, 1, 3, height / 6, height / 3);
  let noiseStep = map(currentLevel, 1, 3, 0.08, 0.15);
  let nOffset = random(1000); // 隨機種子確保每次路徑不同

  for (let i = 0; i < numPoints; i++) {
    let x = map(i, 0, numPoints - 1, 80, width - 80);
    // 使用 Perlin Noise 產生平滑連貫的 y 座標，徹底解決重疊問題
    let n = noise(i * noiseStep, nOffset);
    let y = centerY + map(n, 0.3, 0.7, -amplitude, amplitude, true);
    if (i <= 1 || i >= numPoints - 2) y = centerY;
    pathPoints.push({ x: x, y: y });
  }

  // 初始化玩家位置到起點
  if (pathPoints.length > 0) {
    playerX = pathPoints[0].x;
    playerY = pathPoints[0].y;
  }
}

// 初始化障礙物
function initObstacles() {
  obstacles = [];
  // 第二關與第三關都有移動障礙物
  if (currentLevel >= 2) {
    for (let i = 0; i < 10; i++) {
      obstacles.push({
        x: random(width),
        y: random(height),
        vx: random(-3, 3),
        vy: random(-3, 3),
        size: 25,
        type: "moving"
      });
    }
  }
  // 第三關額外新增出現在路徑上的閃爍障礙物
  if (currentLevel === 3) {
    for (let i = 0; i < 6; i++) {
      // 隨機選取路徑上的點作為位置，避開前 5 個與最後 5 個點，確保起點和終點是安全的
      let safeMin = 5;
      let safeMax = pathPoints.length - 5;
      let p = pathPoints[floor(random(safeMin, safeMax))];
      obstacles.push({
        x: p.x,
        y: p.y,
        size: 35,
        type: "flicker",
        visible: true,
        timer: random(60, 120) // 隨機初始計時器
      });
    }
  }
}

function draw() {
  background(0); // 全螢幕黑色為「危險區域」

  if (gameState === "START_SCREEN") {
    // 繪製遊戲規則說明
    fill(255);
    textSize(40);
    text("電流急急棒 - 遊戲規則", width / 2, height / 2 - 120);
    
    textSize(20);
    fill(200);
    text("1. 沿著灰色路徑移動你的藍色球體", width / 2, height / 2 - 40);
    text("2. 禁止碰觸黑色區域與移動中的淺綠色或黃色障礙物", width / 2, height / 2 - 10);
    text("3. 若碰到危險區域會扣除生命並強制回原點", width / 2, height / 2 + 20);
    text("4. 點擊綠球開始，抵達紅球即可過關", width / 2, height / 2 + 50);
    
    fill(0, 150, 255);
    text("--- 點擊螢幕任何地方進入遊戲 ---", width / 2, height / 2 + 120);

  } else if (gameState === "WAITING" || gameState === "PLAYING") {
    // 繪製灰色蜿蜒路徑 (安全區域)
    noFill();
    stroke(100); // 灰色路徑
    strokeWeight(pathWidth); 
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

    // 繪製重新設計的起點與終點
    drawMarker(pathPoints[0].x, pathPoints[0].y, "START", color(0, 255, 100));
    drawMarker(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y, "GOAL", color(255, 50, 50));

    // 繪製左上角 HUD (Level & Lives) 重新設計
    push();
    translate(25, 25);
    
    // 1. 外框背景面板
    noStroke();
    fill(30, 30, 30, 200); // 深色半透明背景
    rectMode(CORNER);
    rect(0, 0, 160, 50, 8); // 帶圓角的矩形
    
    // 裝飾用細線條
    stroke(0, 150, 255, 150);
    strokeWeight(1);
    noFill();
    rect(0, 0, 160, 50, 8);

    // 2. 關卡資訊 (Level)
    textAlign(LEFT, CENTER);
    noStroke();
    fill(0, 150, 255); // 藍色標籤
    textSize(11);
    textStyle(BOLD);
    text("LEVEL", 12, 16);
    fill(255);
    textSize(22);
    text("0" + currentLevel, 12, 34); // 格式化為 01, 02...
    
    // 3. 生命值圖示 (Lives)
    textStyle(NORMAL);
    for (let i = 0; i < 3; i++) {
      textSize(18);
      // 如果生命還在顯示紅心，扣除的顯示黑心
      text(i < lives ? "❤️" : "🖤", 65 + i * 28, 25);
    }
    pop();

    // 碰撞檢查：取得滑鼠位置的顏色
    let currentColor = get(mouseX, mouseY);
    let hit = false;
    
    if (gameState === "PLAYING") {
      // 如果滑鼠在黑色背景上，觸發碰撞但不更新球的位置
      if (currentColor[0] === 0 && currentColor[1] === 0 && currentColor[2] === 0) {
        hit = true;
      } else {
        // 只有在路徑內（非黑色區域）才更新球的座標
        playerX = mouseX;
        playerY = mouseY;
      }
    }

    // 繪製並更新障礙物
    noStroke(); // 關鍵修正：取消路徑產生的粗邊框，否則圓球顏色會被遮住
    for (let obs of obstacles) {
      if (obs.type === "flicker") {
        obs.timer--;
        if (obs.timer <= 0) {
          obs.visible = !obs.visible;
          obs.timer = obs.visible ? 90 : 60; // 出現久一點，消失快一點
        }
      }

      if (obs.type === "moving" || (obs.type === "flicker" && obs.visible)) {
        if (obs.type === "flicker") {
          fill(255, 255, 0); // 黃色閃爍障礙物
        } else {
          fill(180, 255, 180); // 淺綠色移動障礙物
        }
        ellipse(obs.x, obs.y, obs.size);

        if (obs.type === "moving") {
          obs.x += obs.vx;
          obs.y += obs.vy;
          // 邊界反彈
          if (obs.x < 0 || obs.x > width) obs.vx *= -1;
          if (obs.y < 0 || obs.y > height) obs.vy *= -1;
        }

        // 障礙物碰撞檢查
        if (gameState === "PLAYING" && dist(playerX, playerY, obs.x, obs.y) < (PLAYER_SIZE / 2 + obs.size / 2)) {
          hit = true;
        }
      }
    }

    if (hit) {
      skullTimer = 30; // 顯示骷髏約 0.5 秒 (30幀)
      lives--;
      if (lives <= 0) {
        gameEndTime = millis(); // 紀錄失敗時間
        gameState = "DEATH_ANIMATION"; // 進入死亡動畫狀態
      } else {
        gameState = "WAITING"; // 扣血後回到該關卡起點
        // 將球的位置重置回起點
        if (pathPoints.length > 0) {
          playerX = pathPoints[0].x;
          playerY = pathPoints[0].y;
        }
      }
    }

    // 檢查是否到達終點
    if (dist(playerX, playerY, pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y) < 20) {
      if (currentLevel < 3) {
        // 進入下一關
        currentLevel++;
        initPath();
        initObstacles();
        gameState = "WAITING";
      } else {
        gameEndTime = millis(); // 紀錄勝利時間
        gameState = "WIN";
      }
    }

    // 繪製玩家指標
    fill(0, 150, 255);
    noStroke();
    // 玩家球現在是固定大小
    ellipse(playerX, playerY, PLAYER_SIZE);

  } else if (gameState === "DEATH_ANIMATION") {
    background(0); // 死亡動畫期間只顯示黑色背景和骷髏
    // 骷髏圖示由 handleEffects 處理
    if (skullTimer <= 0) { // 骷髏動畫結束後進入 GAMEOVER 狀態
      gameState = "GAMEOVER";
    }

  } else if (gameState === "GAMEOVER") {
    drawEndScreen("MISSION FAILED", color(255, 50, 50));

  } else if (gameState === "WIN") {
    // 在過關畫面施放煙火
    if (frameCount % 20 === 0) {
      createFirework(random(width), random(height/2, height));
    }
    drawEndScreen("MISSION COMPLETE", color(50, 255, 50));
  }

  // 繪製與更新所有特效
  handleEffects();
}

function drawMarker(x, y, label, c) {
  push();
  translate(x, y);
  
  // 呼吸燈效果 (使用 sin 函數控制透明度與大小)
  let pulse = sin(frameCount * 0.1) * 5;
  let glowAlpha = map(sin(frameCount * 0.1), -1, 1, 50, 150);
  
  // 外圈霓虹發光
  noStroke();
  fill(red(c), green(c), blue(c), glowAlpha);
  ellipse(0, 0, 55 + pulse);
  
  // 主實體圓圈
  stroke(255);
  strokeWeight(2);
  fill(30);
  ellipse(0, 0, 40);
  
  // 文字標籤
  fill(c);
  noStroke();
  textSize(10);
  textStyle(BOLD);
  text(label, 0, 0);
  pop();
}

function drawEndScreen(title, themeColor) {
  let isWin = (gameState === "WIN");
  push();
  // 半透明遮罩
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  // 繪製面板 (勝利時帶有輕微的縮放律動)
  let bounce = isWin ? sin(frameCount * 0.1) * 3 : 0;
  rectMode(CENTER);
  fill(25, 25, 30);
  stroke(themeColor);
  strokeWeight(4);
  rect(width / 2, height / 2, 420 + bounce, 350 + bounce, 25);
  
  // 頂部狀態圖示
  textSize(60);
  text(isWin ? "🏆" : "💀", width / 2, height / 2 - 125);

  // 標題文字
  noStroke();
  fill(themeColor);
  textSize(45);
  textStyle(BOLD);
  text(title, width / 2, height / 2 - 65);

  // 裝飾分隔線
  stroke(themeColor);
  strokeWeight(2);
  line(width / 2 - 150, height / 2 - 30, width / 2 + 150, height / 2 - 30);
  noStroke();
  
  // 結算數據區域 (左右對齊排版)
  fill(240);
  textSize(22);
  textStyle(NORMAL);
  let timeElapsed = ((gameEndTime - gameStartTime) / 1000).toFixed(1);

  let labelX = width / 2 - 100;
  let valueX = width / 2 + 100;
  
  textAlign(LEFT, CENTER);
  text("🚩 最終關卡:", labelX, height / 2 + 15);
  text("⏱️ 總共用時:", labelX, height / 2 + 55);
  text("❤️ 剩餘生命:", labelX, height / 2 + 95);

  textAlign(RIGHT, CENTER);
  text(currentLevel, valueX, height / 2 + 15);
  text(timeElapsed + "s", valueX, height / 2 + 55);
  text(lives > 0 ? lives : 0, valueX, height / 2 + 95);
  
  // CTA 按鈕提示 (加入呼吸燈效果)
  textAlign(CENTER, CENTER);
  let alpha = map(sin(frameCount * 0.15), -1, 1, 100, 255);
  fill(255, alpha);
  textSize(18);
  textStyle(BOLD);
  text("按下 [ 空白鍵 ] 重新開始挑戰", width / 2, height / 2 + 140);
  pop();
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
  // 處理骷髏圖示
  if (skullTimer > 0) {
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(100);
    // 加入隨機位移產生震動效果
    let offsetX = random(-5, 5);
    let offsetY = random(-5, 5);
    text("☠️", width / 2 + offsetX, height / 2 + offsetY);
    pop();
    skullTimer--;
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
  // 如果在起始畫面，點擊後進入等待開始狀態
  if (gameState === "START_SCREEN") {
    gameState = "WAITING";
    return;
  }

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
    gameStartTime = millis(); // 重置時間
    gameEndTime = 0;
    fireworks = []; // 清空特效
    skullTimer = 0;
    initPath();
    initObstacles();
    gameState = "WAITING";
  }
}

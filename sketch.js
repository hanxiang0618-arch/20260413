let projects = [];
let hoverIndex = -1;
let bubbles = [];
let currentIframe = null; // 用於儲存當前顯示的 iframe 容器
let fishes = []; // 存放多條魚的陣列
let gateOpenedTriggered = false; // 追蹤閘門是否已經開啟

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化氣泡
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(5, 15),
      speed: random(0.5, 2),
      col: color(255, 50) // 初始為半透明白色
    });
  }

  // 初始化多條會游的魚
  for (let i = 0; i < 5; i++) {
    fishes.push({
      x: random(width),
      y: random(height * 0.2, height * 0.8),
      size: random(40, 70),
      speed: random(1, 3) * (random() > 0.5 ? 1 : -1),
      color: color(random(200, 255), random(150, 200), random(50, 100), 200),
      url: "https://hackmd.io/@xiangli1234567899/B1pXk7Mpbe",
      phase: random(PI * 2) // 每個魚的波動相位不同
    });
  }

  // 初始化作品資料，你可以根據需要修改這裡的內容
  projects = [
    { title: "第一週作業", desc: "基礎作業", color: color(0, 191, 255), url: "week1/index.html" },
    { title: "第二週作業", desc: "魚", color: color(255, 127, 80), url: "week2/index.html" },
    { title: "第三週作業", desc: "色塊", color: color(144, 238, 144), url: "week3/index.html" },
    { title: "第四週作業", desc: "網頁文字(dom)", color: color(255, 215, 0), url: "week4/index.html" },
    { title: "第五週作業", desc: "水草", color: color(218, 112, 214), url: "week5/index.html" },
    { title: "第六週作業 (1)", desc: "電流急急棒", color: color(72, 209, 204), url: "week6.1/index.html" },
    { title: "第六週作業 (2)", desc: "踩地雷", color: color(255, 105, 180), url: "week6.2/index.html" }
  ];
  
  textAlign(CENTER, CENTER);
}

function draw() {
  // 深海背景漸層色
  background(0, 27, 46);
  drawBackgroundEffect();

  // 在海草之前繪製魚，這樣它就會在海草後方
  updateAndDrawFish();

  // 繪製海床
  noStroke();
  fill(10, 40, 60);
  rect(0, height - 40, width, 40);

  let seaweedWidth = 120;
  let seaweedHeight = 400;
  let spacing = 80;
  let totalWidth = projects.length * (seaweedWidth + spacing) - spacing;
  let startX = (width - totalWidth) / 2;
  let groundY = height - 40;

  hoverIndex = -1;

  for (let i = 0; i < projects.length; i++) {
    let x = startX + i * (seaweedWidth + spacing) + seaweedWidth / 2;

    // 針對第四週作品 (索引值為 3) 降低高度，防止其標籤遮擋上方文字
    let h = (i === 3) ? seaweedHeight * 0.7 : seaweedHeight;
    
    // 檢查滑鼠是否在海草的感應區塊內 (矩形區域)
    let isHovered = (mouseX > x - seaweedWidth/2 && mouseX < x + seaweedWidth/2 && 
                    mouseY > groundY - h && mouseY < groundY);
    
    if (isHovered) {
      hoverIndex = i;
      drawProjectSeaweed(projects[i], x, groundY, seaweedWidth, h, true, i);
    } else {
      drawProjectSeaweed(projects[i], x, groundY, seaweedWidth, h, false, i);
    }
  }

  // 標題與說明文字
  fill(255);
  textSize(36);
  textStyle(BOLD);
  text("期中作業展示", width / 2, 80);
  textSize(16);
  textStyle(NORMAL);
  fill(150, 200, 255);
  text("點擊海草探索我的程式作品", width / 2, 120);
}

function drawProjectSeaweed(project, x, y, w, h, isHovered, index) {
  push();
  translate(x, y);
  
  // 隨波逐流的擺動效果
  let sway = sin(frameCount * 0.02 + index * 10) * (isHovered ? 30 : 15);

  // 懸停時發光
  if (isHovered) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = project.color;
  }

  // 繪製多片海草葉子
  noStroke();
  let leafCount = 5;
  for (let j = 0; j < leafCount; j++) {
    let leafAlpha = map(j, 0, leafCount, 150, 255);
    let c = color(red(project.color), green(project.color), blue(project.color), leafAlpha);
    fill(c);
    
    let leafX = (j - leafCount/2) * 15;
    let leafH = h * (0.6 + (j % 3) * 0.2);
    
    beginShape();
    vertex(leafX, 0);
    // 使用控制點畫出彎曲的海草
    bezierVertex(
      leafX - 20, -leafH * 0.3, 
      leafX + sway, -leafH * 0.6, 
      leafX + sway * 1.5, -leafH
    );
    bezierVertex(
      leafX + 10 + sway, -leafH * 0.6, 
      leafX + 20, -leafH * 0.3, 
      leafX + 10, 0
    );
    endShape(CLOSE);
  }

  // 在海草上方顯示文字 (像一個浮動的對話框)
  let labelY = -h - 40;
  if (isHovered) labelY -= 10; // 懸停時稍微往上浮動
  
  // 繪製文字背景泡泡
  fill(255, 255, 255, 20);
  stroke(255, 100);
  strokeWeight(1);
  rectMode(CENTER);
  rect(0, labelY, w + 20, 80, 20);

  // 繪製作品文字
  noStroke();
  fill(255);
  textSize(20);
  text(project.title, 0, labelY - 10);
  fill(200, 240, 255);
  textSize(14);
  text(project.desc, 0, labelY + 20, w);
  
  pop();
}

function drawBackgroundEffect() {
  // 檢查 HTML 中的閘門是否已經被點擊開啟
  if (!gateOpenedTriggered) {
    let overlay = document.getElementById('entry-overlay');
    if (overlay && overlay.classList.contains('opened')) {
      gateOpenedTriggered = true;
    }
  }

  noFill();
  for (let b of bubbles) {
    if (gateOpenedTriggered) {
      // 如果閘門開了，且氣泡還沒變色，就賦予霓虹色
      if (b.col.levels[0] === 255 && b.col.levels[3] === 50) {
        let neonColors = [
          color(255, 0, 255), // 桃紅
          color(0, 255, 255), // 青色
          color(57, 255, 20), // 螢光綠
          color(255, 255, 0), // 鮮黃
          color(255, 20, 147) // 深粉
        ];
        b.col = random(neonColors);
      }
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = b.col;
    }

    stroke(b.col);
    ellipse(b.x, b.y, b.size);
    b.y -= b.speed; // 向上移動
    b.x += sin(frameCount * 0.01 + b.y) * 0.5; // 左右微晃
    
    // 超出頂部後回到下方
    if (b.y < -20) {
      b.y = height + 20;
      b.x = random(width);
      // 如果已經開啟，重生的氣泡也給予新的霓虹隨機色
      if (gateOpenedTriggered) {
        let neonColors = [color(255, 0, 255), color(0, 255, 255), color(57, 255, 20), color(255, 255, 0)];
        b.col = random(neonColors);
      }
    }
  }
  drawingContext.shadowBlur = 0; // 重設發光，以免影響後續繪製
}

function updateAndDrawFish() {
  for (let fish of fishes) {
    // 更新魚的位置
    fish.x += fish.speed;
    
    // 邊界檢查：游出螢幕後回到另一邊
    if (fish.x > width + 100) fish.x = -100;
    if (fish.x < -100) fish.x = width + 100;

    // 計算魚當前的實際高度（包含 sin 波動）並檢查滑鼠是否懸停
    let currentFishY = fish.y + sin(frameCount * 0.05 + fish.phase) * 20;
    let d = dist(mouseX, mouseY, fish.x, currentFishY);
    let isFishHovered = (d < fish.size / 2 + 15); // 稍微放大感應範圍

    // 繪製魚
    push();
    translate(fish.x, currentFishY);
    
    // 根據前進方向翻轉魚
    if (fish.speed < 0) scale(-1, 1);

    // 魚的發光效果：懸停時大幅加強發光半徑並改變光暈顏色
    drawingContext.shadowBlur = isFishHovered ? 50 : 15;
    drawingContext.shadowColor = isFishHovered ? color(255, 255, 200) : fish.color;
    
    fill(fish.color);
    noStroke();
    // 魚身
    ellipse(0, 0, fish.size, fish.size * 0.6);
    // 魚尾
    triangle(-fish.size/2, 0, -fish.size * 0.9, -fish.size * 0.3, -fish.size * 0.9, fish.size * 0.3);
    // 魚眼
    fill(0);
    ellipse(fish.size/4, -fish.size/10, 5, 5);

    // 在魚身上寫「筆記」
    push();
    if (fish.speed < 0) scale(-1, 1); // 確保文字不會因為魚的轉向而變成鏡像
    fill(0);
    textSize(12);
    textStyle(BOLD);
    text("筆記", -2, 2);
    pop();

    pop();
  }
}

function mousePressed() {
  // 如果進場閘門還在（包含正在開門的動畫期間），則不觸發後續的作品點擊邏輯
  if (document.getElementById('entry-overlay')) {
    return;
  }

  // 如果已經有視窗開啟，則不重複觸發
  if (currentIframe) return;

  // 檢查是否點擊到任何一條魚
  for (let fish of fishes) {
    let currentFishY = fish.y + sin(frameCount * 0.05 + fish.phase) * 20;
    let d = dist(mouseX, mouseY, fish.x, currentFishY);
    if (d < fish.size / 2 + 10) {
      showProjectIframe(fish.url);
      return;
    }
  }

  // 如果點擊了某個海草，以 iframe 方式開啟連結
  if (hoverIndex !== -1) {
    showProjectIframe(projects[hoverIndex].url);
    return;
  }

  // 檢查是否點擊到背景氣泡
  for (let b of bubbles) {
    let d = dist(mouseX, mouseY, b.x, b.y);
    if (d < b.size / 2 + 10) { // 稍微放寬感應區，讓小氣泡更好點擊
      b.y = height + 20; // 氣泡「破掉」並從底部重新產生
      b.x = random(width);
      if (gateOpenedTriggered) {
        let neonColors = [color(255, 0, 255), color(0, 255, 255), color(57, 255, 20), color(255, 255, 0)];
        b.col = random(neonColors);
      }
    }
  }
}

function showProjectIframe(url) {
  // 創建一個全螢幕的黑色半透明遮罩背景
  currentIframe = createDiv();
  currentIframe.style('position', 'fixed');
  currentIframe.style('top', '0');
  currentIframe.style('left', '0');
  currentIframe.style('width', '100%');
  currentIframe.style('height', '100%');
  currentIframe.style('background', 'rgba(0, 0, 0, 0.85)');
  currentIframe.style('display', 'flex');
  currentIframe.style('justify-content', 'center');
  currentIframe.style('align-items', 'center');
  currentIframe.style('z-index', '1000');

  // 創建 iframe 容器
  let container = createDiv();
  container.style('width', '80%');
  container.style('height', '80%');
  container.style('position', 'relative');
  container.parent(currentIframe);

  // 創建右上角的關閉按鈕 (X)
  let closeBtn = createDiv('×');
  closeBtn.style('position', 'absolute');
  closeBtn.style('top', '-50px'); // 放在容器上方
  closeBtn.style('right', '0');
  closeBtn.style('font-size', '44px');
  closeBtn.style('color', 'white');
  closeBtn.style('cursor', 'pointer');
  closeBtn.style('line-height', '1');
  closeBtn.style('user-select', 'none');
  closeBtn.parent(container);

  // 點擊 X 關閉視窗
  closeBtn.mousePressed(() => {
    currentIframe.remove();
    currentIframe = null;
  });

  // 創建 iframe 本體
  let frame = createElement('iframe');
  frame.attribute('src', url);
  frame.style('width', '100%');
  frame.style('height', '100%');
  frame.style('border', '2px solid white');
  frame.style('border-radius', '10px');
  frame.parent(container);

  // 點擊黑色半透明背景處關閉 (排除點擊到內容容器的情況)
  currentIframe.mousePressed((e) => {
    if (e.target === currentIframe.elt) {
      currentIframe.remove();
      currentIframe = null;
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

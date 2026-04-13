let projects = [];
let hoverIndex = -1;
let bubbles = [];
let currentIframe = null; // 用於儲存當前顯示的 iframe 容器

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化氣泡
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(5, 15),
      speed: random(0.5, 2)
    });
  }

  // 初始化作品資料，你可以根據需要修改這裡的內容
  projects = [
    { title: "第一週作業", desc: "校網", color: color(0, 191, 255), url: "week1/index.html" },
    { title: "第二週作業", desc: "電流急急棒", color: color(255, 127, 80), url: "week2/index.html" }
  ];
  
  textAlign(CENTER, CENTER);
}

function draw() {
  // 深海背景漸層色
  background(0, 27, 46);
  drawBackgroundEffect();

  // 繪製海床
  noStroke();
  fill(10, 40, 60);
  rect(0, height - 40, width, 40);

  let seaweedWidth = 150;
  let seaweedHeight = 400;
  let spacing = 250;
  let totalWidth = projects.length * (seaweedWidth + spacing) - spacing;
  let startX = (width - totalWidth) / 2;
  let groundY = height - 40;

  hoverIndex = -1;

  for (let i = 0; i < projects.length; i++) {
    let x = startX + i * (seaweedWidth + spacing) + seaweedWidth / 2;
    
    // 檢查滑鼠是否在海草的感應區塊內 (矩形區域)
    let isHovered = (mouseX > x - seaweedWidth/2 && mouseX < x + seaweedWidth/2 && 
                    mouseY > groundY - seaweedHeight && mouseY < groundY);
    
    if (isHovered) {
      hoverIndex = i;
      drawProjectSeaweed(projects[i], x, groundY, seaweedWidth, seaweedHeight, true, i);
    } else {
      drawProjectSeaweed(projects[i], x, groundY, seaweedWidth, seaweedHeight, false, i);
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
  // 繪製氣泡
  stroke(255, 50);
  noFill();
  for (let b of bubbles) {
    ellipse(b.x, b.y, b.size);
    b.y -= b.speed; // 向上移動
    b.x += sin(frameCount * 0.01 + b.y) * 0.5; // 左右微晃
    
    // 超出頂部後回到下方
    if (b.y < -20) {
      b.y = height + 20;
      b.x = random(width);
    }
  }
}

function mousePressed() {
  // 如果已經有視窗開啟，則不重複觸發
  if (currentIframe) return;

  // 如果點擊了某個海草，以 iframe 方式開啟連結
  if (hoverIndex !== -1) {
    showProjectIframe(projects[hoverIndex].url);
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

  // 創建 iframe 本體
  let frame = createElement('iframe');
  frame.attribute('src', url);
  frame.style('width', '100%');
  frame.style('height', '100%');
  frame.style('border', '2px solid white');
  frame.style('border-radius', '10px');
  frame.parent(container);

  // 點擊背景處關閉
  currentIframe.mousePressed(() => {
    currentIframe.remove();
    currentIframe = null;
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

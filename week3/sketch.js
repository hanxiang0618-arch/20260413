let trail = []; // 儲存所有圓圈的位置與顏色資訊
let fixedDiameter = 60; // 圓形的固定直徑
let gridSize = 70; // 縮小網格單元的大小，使圓圈距離更靠近

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);

  // 1. 初始化：讓圓圈在一開始就佈滿整個螢幕
  // 使用比直徑略小的間距來產生一點重疊感
  for (let x = 0; x <= width + gridSize; x += gridSize) {
    for (let y = 0; y <= height + gridSize; y += gridSize) {
      trail.push({
        x: x,
        y: y,
        // 讓初始背景圓圈的色相也隨 X 與 Y 雙向分佈
        h: (map(x, 0, width, 0, 180) + map(y, 0, height, 0, 180)) % 360
      });
    }
  }
}

function draw() {
  background(0, 0, 95); // 淺灰色背景

  // 2. 顏色隨滑鼠水平 (mouseX) 與垂直 (mouseY) 位置共同變化
  let baseHue = (map(mouseX, 0, width, 0, 180) + map(mouseY, 0, height, 0, 180)) % 360;

  // 3. 每一排每一列的複製貼上效果
  if (mouseX !== pmouseX || mouseY !== pmouseY) {
    // 計算滑鼠在一個網格單元內的相對座標
    let offsetX = mouseX % gridSize;
    let offsetY = mouseY % gridSize;
    
    // 在每一排與每一列的對應位置都「貼」上圓圈
    for (let tx = offsetX; tx <= width + gridSize; tx += gridSize) {
      for (let ty = offsetY; ty <= height + gridSize; ty += gridSize) {
        trail.push({ x: tx, y: ty, h: baseHue });
      }
    }
  }

  stroke(0, 40); // 加上輕微透明的細邊框
  strokeWeight(1);

  // 4. 繪製所有圓形（移除移動邏輯，讓圖形固定在原位）
  for (let p of trail) {
    // 每個點的座標固定，不再更新 p.x 和 p.y
    // 顏色則保持該點被「貼」上去時的設定
    let h = (p.h + baseHue) % 360;
    fill(h, 60, 95);
    ellipse(p.x, p.y, fixedDiameter, fixedDiameter);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
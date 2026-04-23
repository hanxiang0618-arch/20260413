function setup() {
  // 1. 建立一個充滿視窗的畫布
  createCanvas(windowWidth, windowHeight);
  // 使用 HSB 顏色模式 (色相 0-360, 飽和度 0-100, 亮度 0-100)
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 95); // 淺灰色背景

  let diameter = 100;    // 圓形的直徑
  let spacingX = diameter * 0.8; // 水平間距 (小於直徑產生重疊)
  let spacingY = diameter * 0.5; // 垂直間距

  /**
   * 5. map() 函數說明：
   * map(value, start1, stop1, start2, stop2)
   * 我們將滑鼠的 X 座標 (0 到 width) 映射到 0 到 360 的色相值。
   * 當滑鼠在左側時 baseHue 為 0 (紅色系)，在右側時接近 360。
   */
  let baseHue = map(mouseX, 0, width, 0, 360);

  stroke(0);        // 1. 加上黑色邊框
  strokeWeight(2);  // 線條粗細設定

  // 2. 使用巢狀迴圈繪製圖形
  for (let y = 0; y < height + diameter; y += spacingY) {
    // 2. 魚鱗狀位移：判斷當前是第幾列，如果是奇數列則向右偏移
    let rowCount = floor(y / spacingY);
    let xOffset = (rowCount % 2 === 0) ? 0 : spacingX / 2;

    for (let x = 0; x < width + diameter; x += spacingX) {
      // 3. 強化顏色變化：
      // 每個圓形的色相 = 滑鼠基礎值 + (X座標產生的偏移) + (Y座標產生的偏移)
      // 使用 % 360 是為了確保數值超過 360 後會回到 0，形成色彩循環
      let h = (baseHue + map(x, 0, width, 0, 60) + map(y, 0, height, 0, 60)) % 360;
      
      fill(h, 60, 95); // 使用計算出的色相，飽和度 60，亮度 95
      ellipse(x + xOffset, y, diameter, diameter);
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
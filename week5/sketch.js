let grasses = [];
let bubbles = [];
let iframe;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，以便操作下方的網頁
  cnv.position(0, 0);
  cnv.style('z-index', '1'); // 確保畫布覆蓋在網頁上層

  iframe = createElement('iframe');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('border', 'none');
  iframe.style('z-index', '0'); // 網頁在下層

  let colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

  for (let k = 0; k < 50; k++) {
    let c = color(random(colors));
    c.setAlpha(100); // 設定透明度，數值越低越透明，重疊效果越明顯
    grasses.push({
      x: random(width), // 位置
      len: random(height * 0.2, height * 0.66), // 高度
      col: c, // 顏色
      thickness: random(30, 60), // 粗細
      swaySpeed: random(0.005, 0.02), // 搖晃速度
      swayOffset: random(1000) // 搖晃偏移
    });
  }
}

function draw() {
  // 背景顏色改為 RGBA，透明度 0.2 (255 * 0.2 = 51)，讓後方網頁可見
  clear();
  background(3, 161, 252, 51);
  blendMode(BLEND);

  noFill();

  for (let k = 0; k < grasses.length; k++) {
    let g = grasses[k];
    stroke(g.col);
    strokeWeight(g.thickness);

    beginShape();
    curveVertex(g.x, height); // 起始控制點
    curveVertex(g.x, height); // 底部固定點

    let xOffset, y;
    for (let i = 0; i <= g.len; i += 7) {
      y = height - i;
      // 利用 noise 和 map 計算擺動，高度越高 (i 越大) 擺動幅度越大
      let n = noise(i * 0.01, frameCount * g.swaySpeed + g.swayOffset);
      xOffset = map(n, 0, 1, -i * 0.2, i * 0.2);
      curveVertex(g.x + xOffset, y);
    }
    curveVertex(g.x + xOffset, y); // 結束控制點
    endShape();
  }

  // 氣泡產生與繪製邏輯
  if (random() < 0.05) { // 每一幀有 5% 機率產生新氣泡
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    if (b.isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (iframe) {
    iframe.size(windowWidth, windowHeight);
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(10, 50); // 從視窗底部下方開始
    this.d = random(10, 30); // 氣泡大小
    this.speed = random(1, 3); // 上升速度
    this.popHeight = random(height * 0.2, height * 0.8); // 設定破掉的高度
    this.popped = false;
    this.popTimer = 0;
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      this.x += sin(frameCount * 0.05 + this.y * 0.01) * 0.5; // 輕微左右搖晃
      if (this.y < this.popHeight) {
        this.popped = true;
      }
    } else {
      this.popTimer++;
    }
  }

  display() {
    if (!this.popped) {
      noStroke();
      fill(255, 127); // 水泡顏色白色，透明度0.5 (255*0.5 ≈ 127)
      circle(this.x, this.y, this.d);
      
      fill(255, 178); // 水泡上面的白色圓圈，透明度0.7 (255*0.7 ≈ 178)
      circle(this.x + this.d * 0.2, this.y - this.d * 0.2, this.d * 0.3);
    } else {
      // 破掉的效果：擴大的圓框
      noFill();
      stroke(255, map(this.popTimer, 0, 10, 255, 0));
      strokeWeight(2);
      circle(this.x, this.y, this.d + this.popTimer * 3);
    }
  }

  isDead() {
    return this.popped && this.popTimer > 10;
  }
}

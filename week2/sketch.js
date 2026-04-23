/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數
let shapes = [];
let bubbles = [];
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標 (這裡使用一個六邊形作為範例)
let points = [
  [-6, 2], [-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], [8, -1], [6, 0], [0, -3], [2, -6], [-2, -3], [-4, -2], [-5, -1], [-4, 1], [-6, 1]
];

function preload() {
  // 在程式開始前預載入外部音樂資源
  // 請確保 'midnight-quirk-255361.mp3' 檔案存在於專案資料夾中，否則會出現 404 錯誤
  song = loadSound('midnight-quirk-255361.mp3', 
    () => console.log('Music loaded successfully'), 
    () => console.error('Error loading music: File not found. Please add "midnight-quirk-255361.mp3" to your project.')
  );
}

function setup() {
  // 初始化畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化振幅物件
  amplitude = new p5.Amplitude();
  
  // 播放音樂 (循環)
  // 注意：由於瀏覽器的自動播放策略，音樂可能需要使用者互動（如點擊）後才會開始播放
  if (song.isLoaded()) {
    song.loop();
  }

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    let shape = {
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      // 透過 map() 讀取全域陣列 points，將每個頂點的 x 與 y 分別乘上 10 到 30 之間的隨機倍率來產生變形
      points: points.map(pt => {
        let mult = random(10, 30);
        return [pt[0] * mult, pt[1] * mult];
      })
    };
    shapes.push(shape);
  }
}

function draw() {
  // 設定背景顏色
  background('#ffcdb2');
  
  // 產生並繪製泡泡
  if (random(1) < 0.05) {
    bubbles.push({
      x: random(width),
      y: height + 10,
      size: random(10, 30),
      speed: random(1, 3)
    });
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.y -= b.speed;
    b.x += random(-1, 1);
    fill(255, 50);
    stroke(255);
    strokeWeight(2);
    ellipse(b.x, b.y, b.size);
    if (b.y < -20) bubbles.splice(i, 1);
  }

  // 設定邊框粗細
  strokeWeight(2);
  
  // 取得當前音量大小（數值介於 0 到 1）
  let level = amplitude.getLevel();
  
  // 使用 map() 函式將 level 從 (0, 1) 的範圍映射到 (0.5, 2) 的範圍
  let sizeFactor = map(level, 0, 1, 0.5, 2);
  
  // 使用 for...of 迴圈走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;
    
    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }
    
    // 設定外觀
    fill(shape.color);
    stroke(shape.color);
    
    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    // 根據移動方向調整水平縮放，實現左右翻轉效果
    if (shape.dx > 0) {
      scale(-1, 1); // 往右移動時，左右顛倒
    }
    scale(sizeFactor);
    
    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    endShape(CLOSE);
    
    // 狀態還原
    pop();
  }
}

// 處理瀏覽器自動播放策略：點擊畫面以啟動音訊環境，並控制音樂播放/暫停
function mousePressed() {
  if (getAudioContext().state !== 'running') {
    userStartAudio();
  }

  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

// 視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

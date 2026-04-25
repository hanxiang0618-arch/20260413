let input;
let slider;
let button;
let sel;
let isWaving = false;
let iframe;

function setup() {
  // 創建一個佔滿整個視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 創建一個文字輸入框
  input = createInput();
  // 設定輸入框的位置
  input.position(20, 20);
  // 設定輸入框的寬度與高度為 50 像素
  input.size(50, 50);
  input.style('color', '#00CACA');
  input.style('background-color', 'purple');
  // 創建一個滑桿，範圍 15-80，預設值 30
  slider = createSlider(15, 80, 30);
  slider.position(90, 35);
  
  // 創建一個按鈕，位於滑桿右邊 (90 + 130 + 20 = 240)
  button = createButton('跳動開關');
  button.position(240, 35);
  button.mousePressed(() => isWaving = !isWaving);

  // 創建下拉式選單並放在按鈕右邊
  sel = createSelect();
  sel.position(350, 35);
  sel.option('淡江大學', 'https://www.tku.edu.tw');
  sel.option('淡江教科系', 'https://www.et.tku.edu.tw');
  // 當選單內容改變時，更新 iframe 的連結
  sel.changed(() => {
    iframe.attribute('src', sel.value());
  });

  // 設定文字大小與對齊方式
  textAlign(LEFT, CENTER);
  
  // 創建一個 iframe 來顯示網頁，並設定在視窗中間 (四周距離 200px)
  iframe = createElement('iframe');
  iframe.position(200, 200);
  iframe.size(windowWidth - 400, windowHeight - 400);
  iframe.attribute('src', 'https://www.tku.edu.tw');
}

function draw() {
  background(220);

  // 取得輸入框的文字
  let txt = input.value();
  
  // 根據滑桿的值來設定文字大小
  textSize(slider.value());

  // 定義漸層顏色陣列
  let colors = [
    "#28004D", "#3A006F", "#4B0091", "#5B00AE", "#6F00D2", 
    "#8600FF", "#921AFF", "#B15BFF", "#CA8EFF"
  ];

  // 如果輸入框有文字
  if (txt.length > 0) {
    // 計算單一文字字串的寬度
    let txtWidth = textWidth(txt);

    // 如果文字寬度大於0，避免因空字串造成無限迴圈
    if (txtWidth > 0) {
      // 外層迴圈：從 y=100 開始，每隔 50px 換行，填滿整個視窗
      for (let y = 100; y < height; y += 50) {
        // 計算行數索引，用來判斷奇數或偶數行
        let rowIndex = floor((y - 100) / 50);
        // 計算顏色索引，讓顏色循環使用
        let colorIndex = rowIndex % colors.length;
        fill(colors[colorIndex]);

        // 內層迴圈：在每一行中，水平重複繪製文字
        for (let x = 0; x < width; x += txtWidth) {
          // 如果開啟跳動效果，計算 x 與 y 的偏移量
          let xOffset = 0;
          let yOffset = 0;
          if (isWaving) {
            // 讓奇數行與偶數行的跳動方向相反 (偶數行乘 1，奇數行乘 -1)
            let direction = rowIndex % 2 === 0 ? 1 : -1;
            // 上下左右移動：使用 cos 計算 x，sin 計算 y，加入 x 參數讓同一排文字跳動不同步
            let angle = frameCount * 0.1 + x * 0.02;
            xOffset = cos(angle) * 20 * direction;
            yOffset = sin(angle) * 20 * direction;
          }
          text(txt, x + xOffset, y + yOffset);
        }
      }
    }
  }
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新調整 iframe 的大小與位置，保持四周 200px 的距離
  iframe.position(200, 200);
  iframe.size(windowWidth - 400, windowHeight - 400);
}

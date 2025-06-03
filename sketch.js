let video;
let handpose;
let predictions = [];
let questions = [
  { question: "教科1A的班導師是誰？", options: ["A. 顧大維", "B. 王怡萱"], answer: "A" },
  { question: "長城位於哪個國家？", options: ["A. 日本", "B. 中國"], answer: "B" },
  { question: "艾菲爾鐵塔在哪個城市？", options: ["A. 倫敦", "B. 巴黎"], answer: "B" },
  { question: "虛擬實境（VR）在教育中的主要應用是？", options: ["A. 提供沉浸式學習體驗", "B. 讓學生只能觀看影片"], answer: "A" },
  { question: "人工智慧在教育科技中的作用是？", options: ["A. 幫助個人化學習", "B. 取代所有教師的工作"], answer: "A" },
  { question: "哪種技術可以幫助學生透過遊戲學習？", options: ["A. 純文字教材", "B. 遊戲化學習"], answer: "B" }
];
let currentQuestion = 0;
let showNextTopic = false;
let nextTopicTimer = 0;
let highlightIndex = -1; // 要變色的答案格索引

function setup() {
  createCanvas(windowWidth, windowHeight); // 設定畫布為全螢幕
  video = createCapture(VIDEO); // 啟用攝影機
  video.size(windowWidth, windowHeight); // 設定視訊大小為全螢幕
  video.hide(); // 隱藏原始的 HTML 視訊元素
  textAlign(CENTER, TOP); // 設定文字對齊方式
  textSize(48); // 設定文字大小
  fill(0); // 設定文字顏色為黑色

  handpose = ml5.handpose(video, modelReady); // 初始化手部偵測模型
  handpose.on("predict", results => {
    predictions = results; // 更新偵測結果
  });
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(220);
  image(video, 0, 0, width, height); // 將視訊繪製到畫布上

  // 顯示食指位置並判斷是否選到正確答案
  highlightIndex = -1;
  if (predictions.length > 0 && currentQuestion < questions.length) {
    let hand = predictions[0];
    let indexFinger = hand.annotations.indexFinger;
    if (indexFinger) {
      fill(255, 0, 0); // 紅色
      noStroke();
      ellipse(indexFinger[3][0], indexFinger[3][1], 20, 20); // 食指末端

      // 判斷食指是否碰到正確答案框
      let q = questions[currentQuestion];
      let boxWidth = 400;
      let boxHeight = 50;
      let boxYStart = height / 2 - 20;
      for (let i = 0; i < q.options.length; i++) {
        let boxX = width / 2 - boxWidth / 2;
        let boxY = boxYStart + i * (boxHeight + 10);
        if (
          indexFinger[3][0] > boxX &&
          indexFinger[3][0] < boxX + boxWidth &&
          indexFinger[3][1] > boxY &&
          indexFinger[3][1] < boxY + boxHeight &&
          q.options[i][0] === q.answer && // 檢查選項開頭字母是否為正確答案
          !showNextTopic
        ) {
          showNextTopic = true;
          nextTopicTimer = millis();
          highlightIndex = i;
        }
      }
    }
  }

  text("教育科技", width / 2, 10); // 在螢幕上方顯示文字

  // 顯示問題
  if (currentQuestion < questions.length) {
    let q = questions[currentQuestion];
    textSize(32);
    text(q.question, width / 2, height / 2 - 100);

    // 顯示答案框
    let boxWidth = 400;
    let boxHeight = 50;
    let boxYStart = height / 2 - 20;
    for (let i = 0; i < q.options.length; i++) {
      let boxX = width / 2 - boxWidth / 2;
      let boxY = boxYStart + i * (boxHeight + 10);
      if (i === highlightIndex && showNextTopic) {
        fill(0, 200, 0); // 綠色
      } else {
        fill(255); // 白色
      }
      rect(boxX, boxY, boxWidth, boxHeight, 10); // 繪製圓角矩形
      fill(0); // 黑色文字
      text(q.options[i], width / 2, boxY + boxHeight / 2 - 10);
    }

    // 顯示「下題」
    if (showNextTopic) {
      textSize(28);
      fill(0, 150, 0);
      text("下題", width / 2, height / 2 + 120);
      fill(0);
      // 1秒後進入下一題
      if (millis() - nextTopicTimer > 1000) {
        currentQuestion++;
        showNextTopic = false;
        highlightIndex = -1;
      }
    }
  } else {
    textSize(32);
    text("問答結束！", width / 2, height / 2);
  }
}

function keyPressed() {
  if (currentQuestion < questions.length) {
    let q = questions[currentQuestion];
    if (key.toUpperCase() === q.answer) {
      currentQuestion++; // 正確答案，進入下一題
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 當視窗大小改變時，調整畫布大小
  video.size(windowWidth, windowHeight); // 同步調整視訊大小
}

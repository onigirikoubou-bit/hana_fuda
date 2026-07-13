let hanafudaData = [];
let selectedCards = [];
let drawQueue = [];
const targetCount = 3;
const container = document.getElementById('card-container');
const aiResponse = document.getElementById('ai-response');

// 1. データ読み込み
fetch('hanafuda_data.json')
    .then(response => response.json())
    .then(data => { hanafudaData = data; })
    .catch(error => console.error("データ読み込み失敗:", error));

// シャッフル関数
function getRandomCards(count) {
    let shuffled = [...hanafudaData]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

// ページ読み込み時
window.addEventListener('load', () => {
    drawQueue = getRandomCards(3);
});

// AI通信関連関数
function generateFortunePrompt(cards) {
    const isThreeDraw = cards.length === 3;
    const cardDetails = cards.map((c, i) => `${i + 1}枚目：${c.name}\n【解説】: ${c.description}\n【結論】: ${c.conclusion}\n【個別の運勢】: ${c.fortune}`).join("\n\n");
    return `あなたは熟練の花札占い師です。重み付けを考慮して鑑定してください。
【重み付け】${isThreeDraw ? "1枚目と3枚目を2.5、2枚目を5" : "1枚目を7、2枚目を3"}
【情報】${cardDetails}
【依頼】総合運勢の洞察と、各札の導きをまとめてください。`;
}


// クリックイベント
container.addEventListener('mouseup', () => {
    if (selectedCards.length >= targetCount) return;
    if (!drawQueue || drawQueue.length === 0) drawQueue = getRandomCards(3);

    const nextCard = drawQueue[selectedCards.length];
    const found = hanafudaData.find(c => c.id === nextCard.id);
    
    const slot = document.getElementById(`slot-${selectedCards.length}`);
    slot.style.backgroundImage = "url('hanafuda.png')";
    slot.style.backgroundPosition = `-${found.col * 123}px -${found.row * 185}px`;
    slot.textContent = "";

    selectedCards.push(found);

    if (selectedCards.length === targetCount) {
        let fortuneHtml = selectedCards.map(c => `<p><strong>${c.name}：</strong> ${c.fortune}</p>`).join("");
        aiResponse.innerHTML = `<h3>総合運勢</h3><p id="ai-text">準備が整いました。</p><button id="fortune-button">AIに運勢を解釈してもらう</button><hr><h3>札ごとのメッセージ</h3>${fortuneHtml}`;
        
        document.getElementById('fortune-button').addEventListener('click', async () => {
            document.getElementById('ai-text').textContent = "AIが思考中...";
            const res = await getFortuneFromAI(generateFortunePrompt(selectedCards));
            document.getElementById('ai-text').innerHTML = res.replace(/\n/g, '<br>');
            document.getElementById('fortune-button').style.display = 'none';
        });
    }
});

async function getFortuneFromAI(prompt) {
  const resultArea = document.getElementById('ai-response');
  resultArea.innerText = "鑑定中..."; // 「考え中」を表示

  try {
    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) throw new Error('サーバーに接続できませんでした');

    const data = await response.json();

    // データがあるか確認してから表示
    if (data && data.reply) {
      resultArea.innerText = data.reply;
    } else {
      resultArea.innerText = "AIから回答がありませんでした。";
    }
  } catch (error) {
    console.error("通信エラー:", error);
    resultArea.innerText = "サーバーが起動しているか確認してください。";
  }
}


// ボタンを「いつ」押してもいいように、クリックされた瞬間にボタンを探す書き方にします
document.addEventListener('click', async (event) => {
    // もしクリックされた要素が「占い実行ボタン」だったら
    if (event.target && event.target.id === 'fortune-exec-btn') {
        
        console.log("占いボタンが押されました！");
        
        // AIの結果表示エリアを更新
        const resultArea = document.getElementById('ai-response');
        if (resultArea) {
            resultArea.innerText = "考え中...";
        }

        // 占いのプロンプト
        const prompt = "花札で3枚の札を引きました。それぞれの意味と、総合的な運勢を占ってください。";
        
        // AIと通信する関数を呼び出す
        await getFortuneFromAI(prompt);
    }
});

// ページ全体（document）をクリックしたときに動く仕組み
document.addEventListener('click', async (event) => {
    // もしクリックされた場所のIDが 'fortune-exec-btn' だったら
    if (event.target && event.target.id === 'fortune-exec-btn') {
        
        console.log("動的に生成されたボタンが押されました！");
        
        // 1. 「考え中」と表示
        const resultArea = document.getElementById('ai-response');
        if (resultArea) {
            resultArea.innerText = "鑑定中...";
        }

        // 2. AIへリクエスト送信
        const prompt = "花札で3枚の札を引きました。それぞれの意味と、総合的な運勢を占ってください。";
        await getFortuneFromAI(prompt);
    }
});
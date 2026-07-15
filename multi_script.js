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

    // multi_script.js の一番上のどこかに追記
window.addEventListener('load', () => {
    // サーバーをこっそり起こしておくための軽いリクエスト
    fetch('/ask', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "keep-alive" }) // 軽いメッセージ
    }).catch(err => console.log("起動準備完了"));
});

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
    const cardsText = cards.map(c => `
【札の名前】: ${c.name}
【詳細情報】: ${typeof c.fortune === 'object' ? JSON.stringify(c.fortune) : c.fortune}
    `).join("\n");

    return `
あなたは手練の花札占いの専門家です。以下の3枚の札に基づき、相談者の運勢を占ってください。

■引いた札の情報:
${cardsText}

■依頼内容:
以下の2つの構成で回答を作成してください。

1. 【鑑定結果】: 
引いた札のそれぞれの意味と、相乗効果やバランスを考慮し、総合的な運勢の洞察と、各札の導きを相談者へメッセージを物語るように温かいトーンで書いてください。３枚を引いた場合は１枚目と３枚目を1/4、２枚目を1/2の重みで、２枚引いた場合は１枚目を7/10、２枚目を3/10の重みで鑑定してください。

2. 【運勢詳細まとめ】: 
引いた札が持つ個別の詳細（願望・待ち人・失せ物など）を、3枚分すべて統合・要約してください。各項目について、それぞれの札がどう影響しているかを含めて、以下のフォーマットで簡潔にまとめてください。
・[願望]：(ここに統合された内容)
・[待ち人]：(ここに統合された内容)
・[失せ物]：(ここに統合された内容)
※その他、重要な項目があれば適宜加えてください。そして最後に、前向きになれるようなメッセージを、日本時間の偶数日には短歌風に、奇数日には詩的な文章でまとめてください。なお文章には偶数日とか奇数日とか入れずに、「今日は短歌風に（詩歌風に）まとめます」としてください。

※重要：回答には「引いた札のリスト」や「個別の札ごとのメッセージ」を直接出力・羅列しないでください。必ず上記1と2の形式のみで回答してください。
`;
}


// クリックイベント
// --- containerの開始 ---
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
        aiResponse.innerHTML = `
            <h3>総合運勢</h3>
            <p id="ai-text">準備が整いました。</p>
            <button id="fortune-button">AIに運勢を解釈してもらう</button>
            <div id="fortune-result-area"></div>
        `;

        document.getElementById('fortune-button').addEventListener('click', async () => {
            const aiText = document.getElementById('ai-text');
            const resultArea = document.getElementById('fortune-result-area');
            const fortuneBtn = document.getElementById('fortune-button');
            
            aiText.textContent = "AIが思考中...";
            fortuneBtn.style.display = 'none';

            try {
                const data = await getFortuneFromAI(generateFortunePrompt(selectedCards));
                
                if (data && data.reply) {
                    // 履歴保存を実行
            saveHistory(data.reply);
            
                    resultArea.innerHTML = `
                        <div class="ai-reply">${data.reply.replace(/\n/g, '<br>')}</div>
                        <button id="reset-button" style="margin-top:20px;">もう一度占う</button>
                    `;
                    aiText.textContent = "鑑定完了";

                    // リセットボタンの処理
                    document.getElementById('reset-button').addEventListener('click', () => {
                        selectedCards = [];
                        drawQueue = getRandomCards(3);
                        aiResponse.innerHTML = `
                    <h3>総合運勢</h3>
                    <p id="ai-text">準備が整いました。</p>
                    <button id="fortune-button">AIに運勢を解釈してもらう</button>
                    <div id="fortune-result-area"></div>
                `;
                // ※重要：再配置したボタンに再度イベントを紐付けるため、
                // 上記コード（if (selectedCards.length === targetCount) { ... }）の
                // 全体構造を関数化しておくのが理想ですが、まずはこれで動作を確認してみてください。
                
                // 初回読み込み時のイベント紐付けを再実行するための関数呼び出しが必要になる場合があります
                location.reload(); // ← 確実に直すための手っ取り早い解決策（再読み込み）です
            });
        }
    } catch (err) {
                aiText.textContent = "現在混雑しています。もう一度ボタンを押して再試行してください。";
                fortuneBtn.style.display = 'block';
            }
        });
    } // ← if (selectedCards.length === targetCount) を閉じる
}); // ← containerのmouseupを閉じる

// --- 以下、関数など ---
const retryBtn = document.getElementById('retry-btn');
let lastPrompt = "";

async function getFortuneFromAI(prompt, retries = 3) {
    lastPrompt = prompt; 
    if(retryBtn) retryBtn.style.display = 'none';

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        if (response.status === 503 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return getFortuneFromAI(prompt, retries - 1);
        }

        if (!response.ok) throw new Error('サーバーエラー');
        return await response.json();
    } catch (err) {
        console.error("エラー発生:", err);
        if(retryBtn) retryBtn.style.display = 'block';
        throw err;
    }
}

document.addEventListener('click', async (event) => {
    if (event.target && event.target.id === 'fortune-exec-btn') {
        const resultArea = document.getElementById('ai-response');
        if (resultArea) resultArea.innerText = "鑑定中...";
        
        try {
            // ★ここを修正：上で定義した関数を呼び出すように変更
            const data = await getFortuneFromAI(generateFortunePrompt(selectedCards));
            
            if (data && data.reply && resultArea) {
                resultArea.innerHTML = data.reply.replace(/\n/g, '<br>');
            }
        } catch (error) {
            if (resultArea) resultArea.innerText = "鑑定中にエラーが発生しました。";
        }
    }
});

function saveHistory(resultText) {
    // 履歴を取得して配列に変換
    let history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    
    // 最新の結果を先頭に追加（日付付き）
    history.unshift({
        date: new Date().toLocaleString(),
        content: resultText
    });
    
    // 最新10件に制限
    history = history.slice(0, 10);
    
    // ローカルストレージに保存
    localStorage.setItem('fortuneHistory', JSON.stringify(history));
}

document.getElementById('show-history-btn').addEventListener('click', () => {
    const area = document.getElementById('history-area');
    const list = document.getElementById('history-list');
    
    if (area.style.display === 'none') {
        // 履歴を読み込んで表示
        let history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
        if (history.length === 0) {
            list.innerHTML = "<p>まだ履歴はありません。</p>";
        } else {
            list.innerHTML = history.map((item, index) => `
                <div style="border-bottom:1px solid #eee; padding:10px;">
                    <strong>${item.date}</strong><br>
                    <p style="font-size:0.9em;">${item.content.replace(/\n/g, '<br>').substring(0, 60)}...</p>
                </div>
            `).join("");
        }
        area.style.display = 'block';
    } else {
        area.style.display = 'none';
    }
});
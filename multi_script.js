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
    fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "keep-alive" })
    });
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
    slot.style.backgroundPosition = `-${found.col * 107}px -${found.row * 169}px`;
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
                    resultArea.innerHTML = `
                        <div class="ai-reply">${data.reply.replace(/\n/g, '<br>')}</div>
                        <button id="reset-button" style="margin-top:20px;">もう一度占う</button>
                    `;
                    aiText.textContent = "鑑定完了";

                    // ★追加：履歴に保存して画面を更新する
                    updateHistory(data.reply, selectedCards);

                    // リセットボタンの処理
                    document.getElementById('reset-button').addEventListener('click', () => {
                        selectedCards = [];
                        drawQueue = getRandomCards(3);
                        aiResponse.innerHTML = ""; // 画面クリア
                        for(let i = 0; i < targetCount; i++) {
                            const slot = document.getElementById(`slot-${i}`);
                            if(slot) {
                                slot.style.backgroundImage = "none";
                                slot.textContent = ""; // 必要に応じて表示を元に戻す
                            }
                        }
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

async function getFortuneFromAI(prompt) {
    lastPrompt = prompt;
    // エラー時の再試行ボタン制御（あれば）
    if (typeof retryBtn !== 'undefined' && retryBtn) retryBtn.style.display = 'none';

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        
        if (!response.ok) {
            throw new Error(`サーバーエラー: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error("占い取得エラー:", err);
        if (typeof retryBtn !== 'undefined' && retryBtn) retryBtn.style.display = 'block';
        throw err; // エラーを呼び出し元に伝える
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

// ページ読み込み時に履歴リストのクリック設定を行う
document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('history-list'); // 履歴リストのIDを指定してください
    const resultArea = document.getElementById('result-area');   // 結果を表示するエリアのID

    if (historyList) {
        historyList.addEventListener('click', (event) => {
            // クリックされた要素が履歴項目（例: liタグ）であるか確認
            if (event.target.tagName === 'LI') {
                const fullText = event.target.getAttribute('data-fulltext');
                if (fullText && resultArea) {
                    resultArea.innerText = fullText;
                }
            }
        });
    }
});

// --- 履歴管理用関数（multi_script.js の末尾に追加） ---
function updateHistory(content, cards) {
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    
    // カード情報から、col と row だけを確実に抽出して新しいオブジェクトを作る
    const safeCards = cards.map(card => ({
        col: card.col,
        row: card.row
    }));
    
    const newItem = {
        date: new Date().toLocaleString(),
        content: content,
        cards: safeCards // ★これで undefined 問題を回避できます
    };
    
    history.unshift(newItem);
    localStorage.setItem('fortuneHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    
    // HTMLの文字列を組み立てる
    let html = '';
    history.forEach((item, index) => {
        // 【重要】onclickをHTML文字列として埋め込む（これで確実に動きます）
        html += `
            <div style="cursor: pointer; padding: 8px; border-bottom: 1px solid #eee;" 
                 onclick="displayHistoryContent(${index})">
                ${item.date} の鑑定
            </div>`;
    });
    
    historyList.innerHTML = html;
}

window.displayHistoryContent = function(index) {
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    const item = history[index];
    const resultArea = document.getElementById('result-area');
    
    // ここで resultArea と item が存在するかチェック
    if (resultArea && item) {
        resultArea.style.display = 'block';
        
        // カード表示用のHTMLを先に作成
        let cardsHtml = '<div style="display:flex; gap:10px; margin:10px 0; height:169px; overflow:hidden;">';
        
        if (item.cards && Array.isArray(item.cards)) {
            item.cards.forEach(card => {
                const col = parseInt(card.col) || 0;
                const row = parseInt(card.row) || 0;
                
                cardsHtml += `
                    <div style="
                        width: 107px; 
                        height: 169px; 
                        background-image: url('hanafuda.png'); 
                        background-position: -${col * 107}px -${row * 169}px;
                        border: 1px solid #ccc;
                        flex-shrink: 0;
                        background-repeat: no-repeat;">
                    </div>`;
            });
        }
        cardsHtml += '</div>';

        // HTMLをセット
        resultArea.innerHTML = `
            <div style="max-width: 400px; margin: 0 auto;">
                <div class="ai-reply">${item.content.replace(/\n/g, '<br>')}</div>
                ${cardsHtml}
                <button id="reset-button-history" style="margin-top:20px;">もう一度占う</button>
            </div>
        `;

        // ボタンのイベント登録
        document.getElementById('reset-button-history').addEventListener('click', () => location.reload());

        // スクロール処理
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log("表示成功:", item.date);

    } else { 
        // この else は、一番上の if (resultArea && item) に対応しています
        console.error("表示失敗: result-areaが見つからないか、アイテムがありません");
    }
};

// 【修正案】fetch を送る部分
async function askAI(message) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    try {
        aiText.textContent = "AI鑑定中...（初回は少し時間がかかります）";
        
        const response = await fetch('/ask', {
            method: 'POST',
            signal: controller.signal, // タイムアウト監視をセット
            body: JSON.stringify({ message })
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        // ...以下、結果を表示する処理...

    } catch (err) {
        if (err.name === 'AbortError') {
            aiText.textContent = "サーバーが起動しています。もう一度ボタンを押してください。";
        } else {
            aiText.textContent = "エラーが発生しました。";
        }
    }
}

// 一番下にこれがあることを確認
document.getElementById('show-history-btn').addEventListener('click', () => {
    // 1. 履歴エリアを表示する
    const historyArea = document.getElementById('history-area');
    if (historyArea) {
        historyArea.style.display = 'block';
    }
    
    // 2. リストを更新・表示する
    renderHistory();
    
    console.log("履歴ボタンが押され、renderHistoryを実行しました");
});

// ページ読み込み時に過去の履歴を表示
// window.addEventListener('DOMContentLoaded', renderHistory);
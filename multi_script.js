let hanafudaData = [];
let selectedCards = [];
let drawQueue = [];

// 1. URLパラメータから枚数とモードを取得
const urlParams = new URLSearchParams(window.location.search);
const targetCount = parseInt(urlParams.get('count')) || 3; 
const isManualMode = urlParams.get('mode') === 'manual';

// 2. 枚数ごとの重み付けルールを一元管理
const fortuneRules = {
    2: { 
        weightText: "２枚引いた場合は１枚目を7/10、２枚目を3/10の重みで鑑定してください。" 
    },
    3: { 
        weightText: "３枚を引いた場合は１枚目と３枚目を1/4、２枚目を1/2の重みで鑑定してください。" 
    },
    getWeightText: function(count) {
        if (this[count]) {
            return this[count].weightText;
        }
        return `${count}枚の札のバランスと調和を均等に考慮し、総合的な運勢を鑑定してください。`;
    }
};

const container = document.getElementById('card-container');
const aiResponse = document.getElementById('ai-response'); 

// 3. データ読み込み ＆ 初期化処理
fetch('hanafuda_data.json')
    .then(response => response.json())
    .then(data => { 
        hanafudaData = data; 
        
        if (isManualMode) {
            // 手動選択モードの場合：sessionStorageから選択されたIDを取得してセット
            const savedIds = JSON.parse(sessionStorage.getItem('manualSelectedIds') || '[]');
            
            // スロットの動的生成と同時にカードをはめ込む
            initSlotsAndManualCards(savedIds);
        } else {
            // 通常のランダムモード
            initRandomSlots();
            drawQueue = getRandomCards(targetCount);
        }
    })
    .catch(error => console.error("データ読み込み失敗:", error));

// サーバー維持用（不要な場合は削除可能ですが残してもOKです）
window.addEventListener('load', () => {
    fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "keep-alive" })
    }).catch(() => {});
});

// スロット生成（通常ランダム用）
function initRandomSlots() {
    const slotWrapper = document.querySelector('.slot-wrapper') || container;
    slotWrapper.innerHTML = '';
    for (let i = 0; i < targetCount; i++) {
        slotWrapper.innerHTML += `<div class="slot" id="slot-${i}">?</div>`;
    }
}

// スロット生成 ＆ 手動選択カードの即時セット
function initManualSlots(cardList) {
    const slotWrapper = document.querySelector('.slot-wrapper') || container;
    slotWrapper.innerHTML = '';
    
    cardList.forEach((found, i) => {
        slotWrapper.innerHTML += `<div class="slot" id="slot-${i}">?</div>`;
    });

    // スロットに画像を反映し、selectedCardsに格納
    cardList.forEach((found, i) => {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.style.backgroundImage = "url('hanafuda.png')";
            slot.style.backgroundPosition = `-${found.col * 123}px -${found.row * 185}px`;
            slot.textContent = "";
        }
        selectedCards.push(found);
    });

    // 手動モードの場合は最初から鑑定スタンバイ状態にする
    triggerReadyState();
}

function initSlotsAndManualCards(ids) {
    const matchedCards = ids.map(id => hanafudaData.find(c => c.id === id)).filter(Boolean);
    initManualSlots(matchedCards);
}

// シャッフル関数（通常モード用）
function getRandomCards(count) {
    let shuffled = [...hanafudaData]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

// AI通信用プロンプト生成
function generateFortunePrompt(cards) {
    const cardsText = cards.map(c => `
【札の名前】: ${c.name}
【詳細情報】: ${typeof c.fortune === 'object' ? JSON.stringify(c.fortune) : c.fortune}
    `).join("\n");

    const count = cards.length;
    const weightRule = fortuneRules.getWeightText(count);

    return `
あなたは手練の日々を占う花札占いの専門家です。以下の${count}枚の札に基づき、相談者の運勢を占ってください。

■引いた札の情報:
${cardsText}

■依頼内容:
以下の2つの構成で回答を作成してください。

1. 【鑑定結果】: 
引いた札のそれぞれの意味と、相乗効果やバランスを考慮し、総合的な運勢の洞察と、各札の導きを相談者へメッセージを物語るように温かいトーンで書いてください。${weightRule}

2. 【運勢詳細まとめ】: 
引いた札が持つ個別の詳細（願望・待ち人・失せ物など）を、すべて統合・要約してください。各項目について、それぞれの札がどう影響しているかを含めて、以下のフォーマットで簡潔にまとめてください。
・[願望]：(ここに統合された内容)
・[待ち人]：(ここに統合された内容)
・[失せ物]：(ここに統合された内容)
※その他、重要な項目があれば適宜加えてください。そして最後に、前向きになれるようなメッセージを、日本時間の偶数日には短歌風に、奇数日には詩的な文章でまとめてください。なお文章には偶数日とか奇数日とか入れずに、「今日は短歌風に（詩歌風に）まとめます」としてください。

※重要：回答には「引いた札のリスト」や「個別の札ごとのメッセージ」を直接出力・羅列しないでください。必ず上記1と2の形式のみで回答してください。
`;
}

// クリック（タップ）イベント（通常ランダムモード時のみ有効）
container.addEventListener('mouseup', () => {
    if (isManualMode) return; // 手動モードのときはクリック抽選を行わない
    if (selectedCards.length >= targetCount) return;
    if (!drawQueue || drawQueue.length === 0) drawQueue = getRandomCards(targetCount);

    const nextCard = drawQueue[selectedCards.length];
    const found = hanafudaData.find(c => c.id === nextCard.id);
    
    const slot = document.getElementById(`slot-${selectedCards.length}`);
    if (slot) {
        slot.style.backgroundImage = "url('hanafuda.png')";
        slot.style.backgroundPosition = `-${found.col * 123}px -${found.row * 185}px`;
        slot.textContent = "";
    }

    selectedCards.push(found);

    if (selectedCards.length === targetCount) {
        triggerReadyState();
    }
});

// 規定枚数に達した、あるいは最初から揃っているときの処理を共通化
function triggerReadyState() {
    const targetArea = aiResponse || document.getElementById('result-area');
    if (targetArea) {
        targetArea.innerHTML = `
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
                        <div class="ai-reply" style="text-align:left; margin-top:20px; width: 100%;">${data.reply.replace(/\n/g, '<br>')}</div>
                        <button id="reset-button" style="margin-top:20px;">もう一度占う</button>
                    `;
                    aiText.textContent = "鑑定完了";

                    updateHistory(data.reply, selectedCards, targetCount);

                    document.getElementById('reset-button').addEventListener('click', () => {
                        if (isManualMode) {
                            window.location.href = 'select.html'; // 手動モードなら選択画面に戻る
                        } else {
                            selectedCards = [];
                            drawQueue = getRandomCards(targetCount);
                            for(let i = 0; i < targetCount; i++) {
                                const s = document.getElementById(`slot-${i}`);
                                if(s) {
                                    s.style.backgroundImage = "none";
                                    s.textContent = "?";
                                }
                            }
                            targetArea.innerHTML = ""; 
                        }
                    });
                }
            } catch (err) {
                aiText.textContent = "現在混雑しています。もう一度ボタンを押して再試行してください。";
                fortuneBtn.style.display = 'block';
            }
        });
    }
}

// AI通信用共通関数
async function getFortuneFromAI(prompt) {
    const response = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });
    
    if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
    }
    return await response.json();
}

// 履歴管理用関数
function updateHistory(content, cards, count) {
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    
    const safeCards = cards.map(card => ({
        col: card.col,
        row: card.row
    }));
    
    const newItem = {
        date: new Date().toLocaleString(),
        count: count,
        content: content,
        cards: safeCards
    };
    
    history.unshift(newItem);
    localStorage.setItem('fortuneHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    let html = '';
    
    history.forEach((item, index) => {
        html += `
            <div style="cursor: pointer; padding: 8px; border-bottom: 1px solid #eee;" 
                 onclick="displayHistoryContent(${index})">
                ${item.date} の鑑定 (${item.count}枚引き)
            </div>`;
    });
    
    historyList.innerHTML = html;
}

window.displayHistoryContent = function(index) {
    const history = JSON.parse(localStorage.getItem('fortuneHistory') || '[]');
    const item = history[index];
    const resultArea = document.getElementById('result-area');
    
    if (resultArea && item) {
        resultArea.style.display = 'block';
        
        let cardsHtml = '<div style="display:flex; gap:10px; margin:10px 0; height:169px;">';
        item.cards.forEach(card => {
            const col = parseInt(card.col) || 0;
            const row = parseInt(card.row) || 0;
            cardsHtml += `
                <div style="
                    width: 107px; 
                    height: 169px; 
                    background-image: url('hanafuda.png'); 
                    background-position: -${col * 123}px -${row * 185}px;
                    border: 1px solid #ccc;
                    flex-shrink: 0;
                    background-repeat: no-repeat;">
                </div>`;
        });
        cardsHtml += '</div>';

        resultArea.innerHTML = `
            <div id="history-content-container" style="display:flex; flex-direction:column; align-items:flex-start; max-width: 400px; margin: 0 auto;">
                <div style="align-self: center;">${cardsHtml}</div>
                <div class="ai-reply" style="text-align:left; margin-top:20px; width: 100%;">${item.content.replace(/\n/g, '<br>')}</div>
                <div style="align-self: center; margin-top:20px;">
                    <button id="reset-button-history">戻る</button>
                </div>
            </div>
        `;

        document.getElementById('reset-button-history').addEventListener('click', () => location.reload());

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

const showHistoryBtn = document.getElementById('show-history-btn');
if (showHistoryBtn) {
    showHistoryBtn.addEventListener('click', () => {
        const historyArea = document.getElementById('history-area');
        if (historyArea) {
            historyArea.style.display = 'block';
        }
        renderHistory();
    });
}
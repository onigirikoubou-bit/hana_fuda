const container = document.getElementById('card-container');
const resultDiv = document.getElementById('result');
let interval = null;
let isDragging = false;

// 起動時は「真っ白」にするために背景を消す（松に鶴問題の解決）
window.addEventListener('load', () => {
    container.style.backgroundImage = "none";
});

//ここから追加
let hanafudaData = {};

// ページ読み込み時にデータを取得
fetch('hanafuda_data.json')
    .then(response => response.json())
    .then(data => {
        hanafudaData = data;
        console.log("読み込み完了。データ数:", hanafudaData.length);
    });

const updatePosition = (card) => {
    // 修正：col（列）をx軸、row（行）をy軸として計算
    // ※画像内の札のサイズに合わせて数値を調整しています
    const x = -(card.col * 123); 
    const y = -(card.row * 185); 
    
    container.style.backgroundPosition = `${x}px ${y}px`;
};

const startShuffle = () => {
    // 1. まず変数を宣言・取得する
    const container = document.getElementById('card-container');
    const resultDiv = document.getElementById('result-area');
    
    // 要素がない場合はここで止める
    if (!container || !resultDiv) return;

    // 2. スタート時にランダムな絵柄を1枚セットする
    const randomStart = hanafudaData[Math.floor(Math.random() * hanafudaData.length)];
    const startX = randomStart.col * (107 + 16);
    const startY = randomStart.row * (169 + 16);
    container.style.backgroundPosition = `-${startX}px -${startY}px`;

    // 3. 状態の初期化
    isDragging = true;
    container.style.backgroundImage = "url('hanafuda.png')";
    resultDiv.style.opacity = "0";
    
    if (interval) clearInterval(interval);
    
    // 4. シャッフル中のランダム処理
    interval = setInterval(() => {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        const found = hanafudaData.find(c => c.id === randomCard.id);
        
        if (found) {
            const posX = found.col * (107 + 16);
            const posY = found.row * (169 + 16);
            container.style.backgroundPosition = `-${posX}px -${posY}px`;
        }
    }, 80);
};


// 関数の中で毎回取得するように修正
const stopShuffle = () => {
    const container = document.getElementById('card-container');
    const resultDiv = document.getElementById('result-area');
    if (!container || !resultDiv) return;

    isDragging = false;
    clearInterval(interval);
    interval = null;


    // 1. カードを決定
    const finalCard = cards[Math.floor(Math.random() * cards.length)];
    const cardId = finalCard.id;
    
    // 2. 検索してデータを見つける
    const found = hanafudaData.find(c => c.id === cardId);
    
    // データがない場合の安全策
    if (!found) {
        console.error("データが見つかりません:", cardId);
        return;
    }

    console.log("今選ばれたカードのIDは:", cardId);

    // 3. カードの表示位置（検索した found から col/row を取得）
    // ※ 123と185は、前回使用していた画像サイズに合わせて調整してください
    const posX = found.col * 107; 
    const posY = found.row * 169; 
    container.style.backgroundPosition = `-${posX}px -${posY}px`;

    // 札の名前を表示
    document.getElementById('heading').textContent = found.name;
    
    // ランクを表示（右側に出したい場合はCSSで調整）
    document.getElementById('rank').textContent = found.rank;
    
    // 結論を表示（少し小さめ）
    document.getElementById('summary').textContent = found.conclusion;

    // 7項目のリストを生成
    // 修正後
const fortuneList = document.getElementById('fortune-list');
fortuneList.innerHTML = `
    <div><span class="mincho-label">願望：</span> ${found.fortune["願望"]}</div>
    <div><span class="mincho-label">待ち人：</span> ${found.fortune["待ち人"]}</div>
    <div><span class="mincho-label">失せ物：</span> ${found.fortune["失せ物"]}</div>
    <div><span class="mincho-label">旅行：</span> ${found.fortune["旅行"]}</div>
    <div><span class="mincho-label">商売：</span> ${found.fortune["商売"]}</div>
    <div><span class="mincho-label">学問：</span> ${found.fortune["学問"]}</div>
    <div><span class="mincho-label">恋愛：</span> ${found.fortune["恋愛"]}</div>
`;

    // 最後に表示を出す
    resultDiv.style.opacity = "1";
};

container.addEventListener('mousedown', startShuffle);
container.addEventListener('mouseup', stopShuffle);
container.addEventListener('touchstart', (e) => { e.preventDefault(); startShuffle(); }, { passive: false });
container.addEventListener('touchend', stopShuffle);


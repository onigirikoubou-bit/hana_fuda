const express = require('express');
const app = express();
const path = require('path'); // 追加

// JSONを扱えるようにする設定（これがないとリクエストを受け取れません）
app.use(express.json());

// ここで初めて app.post が使えるようになります
app.post('/ask', async (req, res) => {
    console.log("【通信テスト】リクエストを受信しました！");
    res.json({ reply: "サーバーからのテスト応答です。通信は正常です。" });
});

// 最後にサーバーを待機させる設定
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました`);
});
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const IS_DEBUG = true; // 開発中は true、本番公開時は false に変える

app.post('/ask', async (req, res) => {
    const { prompt } = req.body;

    // 1. keep-alive 用の軽いリクエスト
    if (prompt === "keep-alive") {
        return res.status(200).json({ reply: "OK" });
    }

    // 2. 開発テスト用の固定レスポンス
    if (IS_DEBUG) {
        return res.status(200).json({ 
            reply: "【開発中テスト回答】\n今日はとても運が良いでしょう。すべての札があなたに微笑んでいます。新しい挑戦を恐れないでください。" 
        });
    }

    // 3. 本番用：APIを叩く処理
    try {
        // ... ここで本来の API 呼び出し処理 ...
    } catch (e) {
        // ...
    }
});

app.listen(3000, () => console.log('サーバーがポート3000で起動しました'));
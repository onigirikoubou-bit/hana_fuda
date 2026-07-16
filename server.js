const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const IS_DEBUG = false; // 開発中は true、本番公開時は false に変える

app.post('/ask', async (req, res) => {
    const { prompt } = req.body;

    if (prompt === "keep-alive") {
        return res.status(200).json({ reply: "OK" });
    }

    if (IS_DEBUG) {
        return res.status(200).json({ 
            reply: "【開発中テスト回答】\n今日はとても運が良いでしょう。" 
        });
    }

    try {
        console.log("AI APIを呼び出します...");
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log("API応答受信完了");
        return res.status(200).json({ reply: text });

    } catch (error) {
        // ★ここが重要：エラーが起きたら必ずエラー内容をログに出し、ブラウザに応答を返す
        console.error("AI APIエラー詳細:", error);
        return res.status(500).json({ 
            reply: "申し訳ありません。現在占い機能が利用できません（エラーが発生しました）。" 
        });
    }
});

app.listen(3000, () => console.log('サーバーがポート3000で起動しました'));
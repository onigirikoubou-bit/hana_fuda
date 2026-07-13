const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // 1. モデルの初期化時に、APIバージョンを正式版(v1)に強制固定します
    // 最新のモデル名に変更してください
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // 2. generateContentを呼び出す際、APIキーが正しく渡されているか確認します
    const result = await model.generateContent(prompt);
    
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("サーバーエラー詳細:", error);
    // クライアント側（ブラウザ）にもエラー内容を返します
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('サーバーがポート3000で起動しました'));
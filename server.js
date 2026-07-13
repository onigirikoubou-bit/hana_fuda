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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ success: true, reply: result.response.text() }); // successフラグを追加
  } catch (error) {
    console.error("エラー:", error);
    if (error.status === 503) {
      res.status(503).json({ error: "ただいまAIが混雑しています。もう一度ボタンを押してみてください。" });
    } else {
      res.status(500).json({ error: "サーバーエラーが発生しました。" });
    }
  }
});

app.listen(3000, () => console.log('サーバーがポート3000で起動しました'));
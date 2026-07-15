// server.js の /ask 部分をこれだけに差し替えます
app.post('/ask', async (req, res) => {
    console.log("【通信テスト】リクエストを受信しました！");
    
    // AI APIは一切呼ばず、即座に応答を返す
    res.json({ reply: "サーバーからのテスト応答です。通信は正常です。" });
});
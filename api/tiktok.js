import axios from "axios";

app.get("/api/tiktok", async (req, res) => {
  const { url, token } = req.query;

  if (token !== "my_super_secret_token_123") {
    return res.status(403).json({ error: "⛔ Sai token" });
  }
  if (!url) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
    const apiRes = await axios.get("https://tiktok-download-video1.p.rapidapi.com/newGetVideo", {
      params: { url, hd: "1" },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
      }
    });

    const data = apiRes.data?.data || {};
    const videoUrl = data.hdplay || data.play || data.wmplay;

    if (!videoUrl) return res.status(500).json({ error: "❌ Không lấy được video" });

    // ⚡ Trả về link trực tiếp
    res.json({ direct: videoUrl });

  } catch (err) {
    console.error("⚠️ Lỗi:", err.message);
    res.status(500).json({ error: "⚠️ Lỗi xử lý video" });
  }
});

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API tải TikTok
app.get("/api/tiktok", async (req, res) => {
  const { url, token } = req.query;

  // ✅ kiểm tra token
  if (token !== "my_super_secret_token_123") {
    return res.status(403).send("⛔ Sai token");
  }

  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    // gọi sang RapidAPI / yt-dlp server của bạn
    const apiRes = await fetch("https://your-yt-dlp-server.com/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await apiRes.json();

    if (!data?.videoUrl) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    // ✅ redirect thẳng tới file mp4 (Safari sẽ tải về Tệp)
    res.redirect(data.videoUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("⚠️ Lỗi xử lý video");
  }
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});

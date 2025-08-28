import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3000;

// API TikTok downloader
app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    const apiUrl = `https://tiktok-downloader-download-tiktok-videos.p.rapidapi.com/vid/index?url=${encodeURIComponent(url)}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-downloader-download-tiktok-videos.p.rapidapi.com"
      }
    });

    const data = await apiRes.json();
    if (!data.video || !data.video[0]?.url) {
      return res.status(404).send("❌ Không tìm thấy video");
    }

    const videoUrl = data.video[0].url;

    // Proxy video về client kèm header tải xuống
    const videoRes = await fetch(videoUrl);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="tiktok.mp4"`);
    videoRes.body.pipe(res);
  } catch (err) {
    console.error("⚠️ Lỗi server:", err);
    res.status(500).send("⚠️ Server error");
  }
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

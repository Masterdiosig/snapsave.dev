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

  if (token !== process.env.API_SECRET_TOKEN) {
    return res.status(403).send("⛔ Sai token");
  }
  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    // gọi RapidAPI
    const apiRes = await fetch("https://tiktok-download-video1.p.rapidapi.com/newGetVideo?hd=1&url=" + encodeURIComponent(url), {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
      }
    });

    const data = await apiRes.json();
    const videoUrl = data?.data?.hdplay || data?.data?.play;

    if (!videoUrl) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    // ✅ tải video từ TikTok rồi stream lại kèm header ép download
    const videoRes = await fetch(videoUrl);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=\"tiktok.mp4\"");

    videoRes.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("⚠️ Lỗi xử lý video");
  }
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});

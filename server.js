import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/tiktok", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
    // Gọi sang RapidAPI
    const apiRes = await fetch("https://tiktok-download-video1.p.rapidapi.com/newGetVideo?url=" + encodeURIComponent(url), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
      }
    });

    const data = await apiRes.json();
    if (!data?.data) return res.status(500).json({ error: "❌ Không lấy được video" });

    const videoUrl = data.data.hdplay || data.data.play;
    if (!videoUrl) return res.status(500).json({ error: "❌ Không có link tải" });

    // Trả ra cả 2 link
    return res.json({
      directUrl: videoUrl, // mở tab trực tiếp
      serverUrl: `/api/redirect?url=${encodeURIComponent(videoUrl)}` // tải qua server
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "⚠️ Lỗi server" });
  }
});

// API redirect (tải qua server)
app.get("/api/redirect", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Thiếu URL");
  res.redirect(url);
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});


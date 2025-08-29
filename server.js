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

  // 🔑 check token
  if (token !== "my_super_secret_token_123") {
    return res.status(403).send("⛔ Sai token");
  }

  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    // ✅ gọi RapidAPI
    const apiRes = await fetch("https://tiktok-download-video1.p.rapidapi.com/newGetVideo?" + new URLSearchParams({
      url: url,
      hd: "1"
    }), {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "your_rapidapi_key",
        "x-rapidapi-host": "tiktok-download-video1.p.rapidapi.com"
      }
    });

    const json = await apiRes.json();
    const videoUrl = json?.data?.hdplay || json?.data?.play;

    if (!videoUrl) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    // ✅ set header để Safari tải về thẳng Tệp
    res.setHeader("Content-Disposition", 'attachment; filename="tiktok.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // ✅ stream video từ TikTok → client
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error("Không stream được video");

    videoRes.body.pipe(res);

  } catch (err) {
    console.error("❌ Lỗi:", err);
    res.status(500).send("⚠️ Lỗi server khi xử lý video");
  }
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "❌ Missing URL" });

  try {
    const apiUrl = `https://tiktok-downloader-download-tiktok-videos.p.rapidapi.com/vid/index?url=${encodeURIComponent(url)}`;

    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-downloader-download-tiktok-videos.p.rapidapi.com"
      }
    });

    const data = await apiRes.json();
    console.log("📦 API response:", data);

    // 👀 check lại đúng field API trả về
    const videoUrl = data?.video?.no_watermark || data?.video?.watermark || data?.video?.[0]?.url;
    if (!videoUrl) {
      return res.status(404).json({ error: "❌ Video not found", raw: data });
    }

    // Stream video thẳng về client
    const videoRes = await fetch(videoUrl);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="tiktok.mp4"');
    videoRes.body.pipe(res);

  } catch (err) {
    console.error("⚠️ Server error:", err);
    res.status(500).json({ error: "⚠️ Server error", detail: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

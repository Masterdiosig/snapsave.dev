import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    // nối URL query
    const apiUrl = `https://tiktok-downloader-download-tiktok-videos.p.rapidapi.com/vid/index?url=${encodeURIComponent(url)}`;

    // gọi API RapidAPI Snapsave
    const apiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-downloader-download-tiktok-videos.p.rapidapi.com"
      }
    });

    const data = await apiRes.json();
    console.log("API response:", data);

    if (!data.video || !data.video[0]?.url) {
      return res.status(404).send("Video not found");
    }

    const videoUrl = data.video[0].url;

    // tải video mp4
    const videoRes = await fetch(videoUrl);
    const videoBuffer = await videoRes.arrayBuffer();

    // gửi file về client (iPhone Safari sẽ lưu trong Files)
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="tiktok.mp4"');
    res.send(Buffer.from(videoBuffer));

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));


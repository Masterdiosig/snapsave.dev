import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();

app.get("/api/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    // gọi API RapidAPI Snapsave
    const apiRes = await fetch("https://tiktok-downloader-download-tiktok-videos.p.rapidapi.com/vid/index", {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-downloader-download-tiktok-videos.p.rapidapi.com"
      },
      qs: { url } // hoặc encodeURIComponent(url) tùy API
    });

    const data = await apiRes.json();
    if (!data.video || !data.video[0]?.url) return res.status(404).send("Video not found");

    const videoUrl = data.video[0].url;

    // fetch video mp4
    const videoRes = await fetch(videoUrl);
    const videoBuffer = await videoRes.arrayBuffer();

    // gửi về với header attachment
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=tiktok.mp4");
    res.send(Buffer.from(videoBuffer));

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

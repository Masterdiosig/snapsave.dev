import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.static("public"));

// API download (GET thay vì POST)
app.get("/api/tiktok", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send("❌ Thiếu URL TikTok");
  }

  try {
    const options = {
      method: "POST",
      url: "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
      },
      data: { url: videoUrl }
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!data || !data.data || !data.data[0]?.url) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    const directLink = data.data[0].url;

    // Stream video về client
    const videoStream = await axios.get(directLink, { responseType: "stream" });
    res.setHeader("Content-Disposition", 'attachment; filename="tiktok.mp4"');
    res.setHeader("Content-Type", "video/mp4");
    videoStream.data.pipe(res);
  } catch (err) {
    console.error("⚠️ Error:", err.message);
    res.status(500).send("⚠️ Không tải được video");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

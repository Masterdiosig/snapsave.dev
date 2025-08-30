import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Trang chủ test form
app.get("/", (req, res) => {
  res.send(`
    <form action="/api/tiktok" method="post">
      <input type="url" name="url" placeholder="TikTok URL..." required style="width:300px">
      <button type="submit">⬇️ Tải video</button>
    </form>
  `);
});

// API download
app.post("/api/tiktok", async (req, res) => {
  const videoUrl = req.body.url || req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "❌ Thiếu URL TikTok" });
  }

  try {
    // Gọi API RapidAPI Snapsave
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
    console.log("✅ API trả về:", response.data);
    const data = response.data;

    if (!data || !data.data || !data.data[0]?.url) {
      return res.status(500).json({ error: "Không lấy được link video" });
    }

    const directLink = data.data[0].url;

    // Stream về client
    const videoStream = await axios.get(directLink, { responseType: "stream" });
    res.setHeader("Content-Disposition", `attachment; filename="SnapSave.Dev.mp4"`);
    res.setHeader("Content-Type", "video/mp4");
    videoStream.data.pipe(res);
  } catch (err) {
    console.error("⚠️ Error:", err.message);
    res.status(500).json({ error: "Không tải được video" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
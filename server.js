import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Trang test form
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
  if (!videoUrl) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
    // Gọi API RapidAPI lấy direct link
    const options = {
      method: "POST",
      url: "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com",
      },
      data: { url: videoUrl },
    };

    const apiResp = await axios.request(options);
    const directLink = apiResp.data?.data?.[0]?.url;
    if (!directLink) return res.status(500).json({ error: "Không lấy được link video" });

    // Stream trực tiếp từ source về client (chunked)
    const videoStream = await axios.get(directLink, { responseType: "stream" });

    res.setHeader("Content-Disposition", `attachment; filename="tiktok.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    // Pipe trực tiếp chunk từ RapidAPI về client
    videoStream.data.pipe(res);

    videoStream.data.on("end", () => console.log("✅ Streaming video xong"));
    videoStream.data.on("error", (err) => {
      console.error("⚠️ Lỗi stream video:", err.message);
      res.end();
    });
  } catch (err) {
    console.error("⚠️ Lỗi API hoặc stream:", err.message);
    res.status(500).json({ error: "Không tải được video" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
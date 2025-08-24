// server.js
import express from "express";
import cors from "cors";
import tiktokHandler from "./tiktok.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Route TikTok
app.post("/api/tiktok", (req, res) => tiktokHandler(req, res));

// Route download video
app.get("/api/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Thiếu URL");

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) throw new Error(`HTTP error! status: ${fetchRes.status}`);

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // Stream trực tiếp về client
    fetchRes.body.pipe(res);
  } catch (err) {
    console.error("❌ Lỗi download:", err);
    res.status(500).send("Lỗi khi tải video");
  }
});

// Serve static files (index.html, main.js, style.css)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy trên http://localhost:${PORT}`);
});

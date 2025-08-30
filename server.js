import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
const PORT = 3000;

// Folder lưu tạm video
const TEMP_DIR = path.join(process.cwd(), "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// Cache: { videoId: { filePath, expiresAt } }
const videoCache = {};

app.use(express.json());
app.use(express.static("public"));

app.get("/api/tiktok", async (req, res) => {
  const { url, token } = req.query;

  if (token !== "my_super_secret_token_123")
    return res.status(403).json({ error: "⛔ Sai token" });
  if (!url) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
    // Lấy videoId từ URL
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (!videoIdMatch) return res.status(400).json({ error: "❌ URL không hợp lệ" });
    const videoId = videoIdMatch[1];

    // Kiểm tra cache
    const cached = videoCache[videoId];
    if (cached && cached.expiresAt > Date.now() && fs.existsSync(cached.filePath)) {
      console.log("✅ Dùng cache video:", videoId);
      return res.download(cached.filePath, "tiktok.mp4");
    }

    // POST request tới RapidAPI
    const apiRes = await axios.post(
      "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      { url },
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com",
        },
      }
    );

    const data = apiRes.data?.data?.[0];
    if (!data) return res.status(500).json({ error: "❌ API không trả dữ liệu video" });

    // Fallback HD → SD → WM
    const videoUrl = data?.hdplay || data?.play || data?.wmplay;
    if (!videoUrl) return res.status(500).json({ error: "❌ Không lấy được video" });

    // Tải video về temp folder
    const tempPath = path.join(TEMP_DIR, `${videoId}.mp4`);
    const videoStream = await axios.get(videoUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(tempPath);
    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      // Cập nhật cache: 10 phút
      videoCache[videoId] = { filePath: tempPath, expiresAt: Date.now() + 10 * 60 * 1000 };
      console.log("✅ Video lưu cache:", videoId);

      // Trả file cho client
      res.download(tempPath, "tiktok.mp4");
    });

    writer.on("error", (err) => {
      console.error("❌ Lỗi ghi video:", err.message);
      res.status(500).json({ error: "⚠️ Lỗi lưu video" });
    });
  } catch (err) {
    console.error("❌ Lỗi API/Server:", err.response?.data || err.message);
    res.status(500).json({ error: "⚠️ Lỗi xử lý video" });
  }
});

// Xóa cache quá hạn
setInterval(() => {
  const now = Date.now();
  for (const key in videoCache) {
    if (videoCache[key].expiresAt < now) {
      fs.unlink(videoCache[key].filePath, (err) => {
        if (!err) console.log("♻️ Xóa cache video:", key);
      });
      delete videoCache[key];
    }
  }
}, 5 * 60 * 1000); // kiểm tra mỗi 5 phút

app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));


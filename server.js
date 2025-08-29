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

  // ✅ kiểm tra token
  if (token !== "my_super_secret_token_123") {
    return res.status(403).send("⛔ Sai token");
  }
  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    // 🔹 gọi sang RapidAPI
    const apiRes = await fetch(
      `https://tiktok-download-video1.p.rapidapi.com/newGetVideo?url=${encodeURIComponent(url)}&hd=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
        }
      }
    );

    const data = await apiRes.json();
    const videoUrl = data?.data?.hdplay || data?.data?.play || data?.data?.wmplay;

    if (!videoUrl) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    // ✅ redirect trực tiếp (Safari tải ngay vào Tệp, không chậm nữa)
    return res.redirect(videoUrl);

  } catch (err) {
    console.error("❌ Lỗi server:", err.message);
    res.status(500).send("⚠️ Lỗi xử lý video");
  }
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});

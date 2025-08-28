import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/tiktok", async (req, res) => {
  const { url, token } = req.query;

  // Kiểm tra token
  if (token !== "my_super_secret_token_123") {
    return res.status(403).send("⛔ Sai token");
  }

  if (!url) return res.status(400).send("❌ Thiếu URL TikTok");

  try {
    const options = {
      method: "GET",
      url: "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      params: { url, hd: "1" },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY, // nhớ để trong .env
        "x-rapidapi-host": "tiktok-download-video1.p.rapidapi.com"
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!data?.result?.play) {
      return res.status(500).send("❌ Không lấy được link video");
    }

    // ✅ redirect thẳng tới link mp4 (Safari sẽ tải về Tệp)
    res.redirect(data.result.play);

  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).send("⚠️ Lỗi kết nối tới API");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

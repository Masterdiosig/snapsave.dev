import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Lấy link TikTok
app.post("/api/tiktok", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
    const apiRes = await fetch(
      "https://tiktok-download-video1.p.rapidapi.com/newGetVideo?url=" + encodeURIComponent(url) + "&hd=1",
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "YOUR_RAPIDAPI_KEY_HERE",
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
        }
      }
    );

    const data = await apiRes.json();
    console.log("📦 RapidAPI trả về:", data);

    const videoHD = data?.data?.hdplay;
    const videoSD = data?.data?.play;
    const videoWM = data?.data?.wmplay;

    const videoUrl = videoHD || videoSD || videoWM;

    if (!videoUrl) {
      return res.status(500).json({ error: "❌ Không lấy được video", raw: data });
    }

    // Trả ra cả 2 link
    return res.json({
      directUrl: videoUrl,
      serverUrl: `/api/redirect?url=${encodeURIComponent(videoUrl)}`
    });

  } catch (err) {
    console.error("❌ Lỗi server:", err);
    res.status(500).json({ error: "⚠️ Lỗi khi gọi RapidAPI", message: err.message });
  }
});

// API redirect (tải qua server)
app.get("/api/redirect", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Thiếu URL");
  res.redirect(url);
});

app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});



import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API tải TikTok
// server.js
app.get("/api/tiktok", async (req, res) => {
  const { url, token } = req.query;
  if (token !== "my_super_secret_token_123") {
    return res.status(403).send("Sai token");
  }

  // gọi RapidAPI lấy link gốc video
  const apiRes = await fetch("https://tiktok-download-video1.p.rapidapi.com/newGetVideo?url=" + url, {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
    }
  });
  const data = await apiRes.json();
  const videoUrl = data?.data?.hdplay || data?.data?.play;

  if (!videoUrl) return res.status(500).send("Không lấy được video");

  // ✅ Redirect trực tiếp
  return res.redirect(videoUrl);
});



app.listen(PORT, () => {
  console.log("✅ Server chạy tại http://localhost:" + PORT);
});

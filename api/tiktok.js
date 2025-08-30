import axios from "axios";

export default async function handler(req, res) {
  const { url, token } = req.query;

  if (token !== "my_super_secret_token_123") {
    return res.status(403).json({ error: "⛔ Sai token" });
  }

  if (!url) {
    return res.status(400).json({ error: "❌ Thiếu URL TikTok" });
  }

  try {
    // POST request đúng chuẩn RapidAPI
    const apiRes = await axios.post(
      "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      { url }, // body JSON
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com",
        },
      }
    );

    const data = apiRes.data?.data?.[0];
    const videoUrl = data?.hdplay || data?.play || data?.wmplay;

    if (!videoUrl) {
      return res.status(500).json({ error: "❌ Không lấy được video" });
    }

    // Stream về client
    const videoStream = await axios.get(videoUrl, { responseType: "stream" });
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="tiktok.mp4"`);
    videoStream.data.pipe(res);
  } catch (err) {
    console.error("❌ Lỗi server:", err.response?.data || err.message);
    return res.status(500).json({ error: "⚠️ Lỗi xử lý video" });
  }
}


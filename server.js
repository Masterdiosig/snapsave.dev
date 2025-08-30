import axios from "axios";

export default async function handler(req, res) {
  const { url, token } = req.query;

  // 🔐 Kiểm tra token
  if (token !== "my_super_secret_token_123") {
    return res.status(403).json({ error: "⛔ Sai token" });
  }

  if (!url) return res.status(400).json({ error: "❌ Thiếu URL TikTok" });

  try {
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
    if (!videoUrl) return res.status(500).json({ error: "❌ Không lấy được link video" });

    // Trả JSON cho client download trực tiếp
    res.status(200).json({ downloadUrl: videoUrl });
  } catch (err) {
    console.error("❌ Lỗi API/Server:", err.response?.data || err.message);
    res.status(500).json({ error: "⚠️ Lỗi xử lý video" });
  }
}

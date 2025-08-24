// /api/tiktok.js
import axios from "axios";

const followRedirect = async (shortUrl) => {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 5,
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    return response.request?.res?.responseUrl || shortUrl;
  } catch (err) {
    console.warn("⚠️ Lỗi redirect:", err.message);
    return shortUrl;
  }
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const secretToken = process.env.API_SECRET_TOKEN;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token !== secretToken) {
    return res.status(403).json({ error: "Forbidden - Invalid token" });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ code: 1, message: "Thiếu URL" });

  const finalUrl = await followRedirect(url);

  try {
    const response = await axios.get(
      "https://tiktok-download-video1.p.rapidapi.com/newGetVideo",
      {
        params: { url: finalUrl, hd: "1" },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "tiktok-download-video1.p.rapidapi.com"
        }
      }
    );

    const data = response.data?.data || {};
    const videoHD = data.hdplay;
    const videoSD = data.play;
    const audio = data.music;
    const downloadUrl = data.downloadUrl;

    const list = [
      ...(videoSD ? [{ url: videoSD, label: "Tải không watermark" }] : []),
      ...(videoHD ? [{ url: videoHD, label: "Tải HD" }] : []),
      ...(audio ? [{ url: audio, label: "Tải nhạc" }] : []),
      ...(downloadUrl ? [{ url: downloadUrl, label: "Tải video (RapidAPI)" }] : [])
    ];

    if (list.length === 0) {
      return res
        .status(200)
        .json({ code: 2, message: "❌ Không lấy được video", raw: data });
    }

    return res.status(200).json({
      code: 0,
      data: list,
      meta: {
        thumbnail: data.cover,
        description: data.description || data.title,
        author:
          data.author?.nickname ||
          data.author?.username ||
          data.author?.unique_id ||
          ""
      }
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      message: "Lỗi server khi gọi RapidAPI",
      error: err.response?.data || err.message
    });
  }
}

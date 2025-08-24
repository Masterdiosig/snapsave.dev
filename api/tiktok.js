import axios from "axios";

const followRedirect = async (shortUrl) => {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 5,
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    return response.request?.res?.responseUrl || shortUrl;
  } catch {
    return shortUrl;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secretToken = process.env.API_SECRET_TOKEN;
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token || token !== secretToken) return res.status(403).json({ error: "Invalid token" });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Thiếu URL" });

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

    if (!videoHD && !videoSD) return res.status(404).json({ error: "Không lấy được video" });

    // Trả link trực tiếp để tải về
    res.status(200).json({
      video: videoHD || videoSD,
      filename: `tiktok-${Date.now()}.mp4`,
      meta: {
        thumbnail: data.cover,
        description: data.description || data.title,
        author: data.author?.nickname || data.author?.username || ""
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server khi gọi RapidAPI" });
  }
}

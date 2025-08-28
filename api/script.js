// Hàm tải về file thẳng vào Tệp iPhone
async function forceDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Không tải được video");

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "tiktok.mp4";
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error("❌ Lỗi tải video:", err);
    alert("Không thể tải video. Vui lòng thử lại.");
  }
}

// Lắng nghe submit form
document.getElementById("downloadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value;
  const resultBox = document.getElementById("resultBox");

  // gọi API backend của bạn
  const res = await fetch(`/api/tiktok?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  if (data?.videoUrl && data?.thumbnail) {
    resultBox.innerHTML = `
      <img src="${data.thumbnail}" class="thumbnail">
      <button onclick="forceDownload('${data.videoUrl}', 'tiktok.mp4')">⬇️ Tải video</button>
    `;
  } else {
    resultBox.innerHTML = `<p>❌ Không lấy được video</p>`;
  }
});

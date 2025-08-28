
  // Toggle menu
  document.querySelector(".nav-toggle").addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("show");
  });

  // FAQ toggle
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.parentElement.classList.toggle('active'));
  });

  // Form submit
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("downloadForm");
    const input = document.getElementById("tiktokUrl");
    const resultBox = document.getElementById("resultBox");
    const pasteBtn = document.getElementById("pasteBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = input.value.trim();
      if (!url) return alert("Vui lòng nhập link TikTok.");
      resultBox.innerHTML = "⏳ Đang xử lý...";

      try {
        const res = await fetch("/api/tiktok", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer my_super_secret_token_123"
          },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        console.log("API trả về:", data);

        if (!data || !data.data || !data.data.length) {
  resultBox.innerHTML = "❌ Không lấy được video.";
  return;
}

resultBox.innerHTML = `
  ${data.meta?.thumbnail ? `<img src="${data.meta.thumbnail}" class="thumbnail" />` : ""}
  ${data.meta?.author ? `<div class="author">@${data.meta.author}</div>` : ""}
  ${data.meta?.description ? `<div class="desc">${data.meta.description}</div>` : ""}
  ${data.data.map(item =>
    `<button onclick="forceDownload('${item.url}', 'video.mp4')">⬇️ ${item.label}</button>`
  ).join("")}
`;

      } catch (err) {
        console.error(err);
        resultBox.innerHTML = "⚠️ Lỗi kết nối tới API.";
      }
    });

    // Nút paste/clear
    pasteBtn.addEventListener("click", async () => {
      if (pasteBtn.textContent === "Paste") {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            input.value = text;
            pasteBtn.textContent = "Clear";
          }
        } catch (err) {
          console.error("Clipboard error:", err);
        }
      } else {
        input.value = "";
        pasteBtn.textContent = "Paste";
        input.focus();
      }
    });

    input.addEventListener("input", () => {
      if (!input.value.trim()) pasteBtn.textContent = "Paste";
    });

    // Cập nhật năm
    document.getElementById("y").textContent = new Date().getFullYear();
  });

  // Force download
 function forceDownload(url, filename) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "video.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(err => console.error("Download error:", err));
}
 
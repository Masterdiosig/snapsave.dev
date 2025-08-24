document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("hf_urli");
  const resultBox = document.getElementById("result");
  const metaBox = document.getElementById("meta");
  const thumb = document.getElementById("thumb");
  const desc = document.getElementById("desc");
  const author = document.getElementById("author");

  function showErrorInline(message) {
    const box = document.getElementById("error-inline");
    const msg = document.getElementById("error-inline-msg");
    msg.textContent = message;
    box.style.display = "block";
    setTimeout(() => { box.style.display = "none"; }, 4000);
  }

  document.getElementById("submit").addEventListener("click", async (e) => {
    e.preventDefault();
    const tiktokUrl = input.value.trim();
    if (!tiktokUrl) {
      showErrorInline("Dán link TikTok hợp lệ!");
      input.focus();
      return;
    }

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my_super_secret_token_123' // phải trùng server
        },
        body: JSON.stringify({ url: tiktokUrl })
      });

      const data = await res.json();

      if (res.status !== 200) {
        showErrorInline(data.error || "Lỗi server");
        return;
      }

      if (data.code === 0 && data.data.length > 0) {
        // hiển thị meta
        if (data.meta?.thumbnail) thumb.src = data.meta.thumbnail;
        desc.textContent = data.meta?.description || "";
        author.textContent = data.meta?.author ? ("Tác giả: " + data.meta.author) : "";
        metaBox.style.display = 'flex';

        // hiển thị nút download
        resultBox.innerHTML = '';
        data.data.forEach((item, idx) => {
          const btn = document.createElement("button");
          btn.textContent = item.label;
          btn.style = "display:block;margin:10px 0;padding:10px;background:#007bff;color:#fff;border:none;border-radius:6px;cursor:pointer;";
          btn.onclick = async () => {
            try {
              const response = await fetch(`/api/download?url=${encodeURIComponent(item.url)}`);
              const blob = await response.blob();
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `video-${idx + 1}.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (err) {
              console.error("Lỗi tải video:", err);
              showErrorInline("Không tải được video.");
            }
          };
          resultBox.appendChild(btn);
        });
      } else {
        metaBox.style.display = 'none';
        resultBox.innerHTML = '';
        showErrorInline(data.message || "Không tìm thấy video!");
      }
    } catch (err) {
      console.error("Lỗi gọi API TikTok:", err);
      showErrorInline("Lỗi kết nối tới máy chủ!");
    }
  });
});

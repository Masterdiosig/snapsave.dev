// public/main.js
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("hf_urli");
  const resultBox = document.getElementById("result");
  const meta = document.getElementById("meta");
  const thumb = document.getElementById("thumb");
  const desc = document.getElementById("desc");
  const author = document.getElementById("author");

  function showError(message) {
    const box = document.getElementById("error-inline");
    const msg = document.getElementById("error-inline-msg");
    msg.textContent = message;
    box.style.display = "block";
    setTimeout(() => { box.style.display = "none"; }, 4000);
  }

  document.getElementById("submit").addEventListener("click", async (e) => {
    e.preventDefault();
    const tiktokUrl = input.value.trim();
    if (!tiktokUrl) { showError("Paste valid link!"); input.focus(); return; }

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my_super_secret_token_123'
        },
        body: JSON.stringify({ url: tiktokUrl })
      });

      const data = await res.json();

      if (data.code === 0 && data.data.length > 0) {
        resultBox.innerHTML = '';
        if (data.meta?.thumbnail) thumb.src = data.meta.thumbnail;
        desc.textContent = data.meta?.description || '';
        author.textContent = data.meta?.author ? ('Tác giả: ' + data.meta.author) : '';
        meta.style.display = 'flex';

        for (const item of data.data) {
          const btn = document.createElement("button");
          btn.textContent = item.label;
          btn.style = "display:block;margin:10px 0;padding:10px;background:#007bff;color:#fff;border:none;border-radius:6px;cursor:pointer;";
          btn.onclick = () => {
            const a = document.createElement('a');
            a.href = item.url;
            a.download = "video.mp4";
            document.body.appendChild(a);
            a.click();
            a.remove();
          };
          resultBox.appendChild(btn);
        }

      } else {
        meta.style.display = 'none';
        resultBox.innerHTML = '';
        showError(data.message || "Không tìm thấy video!");
      }

    } catch (err) {
      console.error("Lỗi gọi API:", err);
      showError("Lỗi kết nối máy chủ!");
    }
  });
});

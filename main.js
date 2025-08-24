const menuBtn = document.querySelector('.menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    item.classList.toggle('active');
  });
});

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
});


document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("hf_urli");
  const resultBox = document.getElementById("result");

  function showErrorInline(message) {
    const box = document.getElementById("error-inline");
    const msg = document.getElementById("error-inline-msg");
    msg.textContent = message;
    box.style.display = "block";
    setTimeout(() => {
      box.style.display = "none";
    }, 4000);
  }

  document.getElementById("submit").addEventListener("click", async (e) => {
    e.preventDefault();
    const tiktokUrl = input.value.trim();

    if (!tiktokUrl) {
      showErrorInline("Paste valid link!");
      input.focus();
      return;
    }

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer my_super_secret_token_123' // đổi nếu bạn dùng token khác
        },
        body: JSON.stringify({ url: tiktokUrl })
      });

      const data = await res.json();

      if (data.code === 0 && data.data.length > 0) {
        resultBox.innerHTML = ''; // clear cũ

        for (const item of data.data) {
          const btn = document.createElement("button");
          btn.textContent = item.label;
          btn.style = "display:block;margin:10px 0;padding:10px;background:#007bff;color:#fff;border:none;border-radius:6px;cursor:pointer;";

          btn.onclick = async () => {
            try {
              const response = await fetch(`/api/download?url=${encodeURIComponent(item.url)}`);
              const blob = await response.blob();

              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = "video.mp4"; // có thể dùng item.label nếu muốn tên riêng
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (err) {
              console.error("Lỗi tải video:", err);
              showErrorInline("Không tải được video.");
            }
          };

          resultBox.appendChild(btn);
        }
      } else {
        showErrorInline("Không tìm thấy video phù hợp!");
      }

    } catch (error) {
      console.error("Lỗi gọi API TikTok:", error);
      showErrorInline("Lỗi kết nối tới máy chủ!");
    }
  });
});
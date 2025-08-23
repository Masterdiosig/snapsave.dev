(function () {
  const isInApp = navigator.userAgent.includes('SnapthApp');
  const lang = document.documentElement.getAttribute('lang') || 'en';
  const theme = document.documentElement.getAttribute('data-theme') || 'light';

  // Gắn class dark theme nếu cần
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Xử lý giao diện ngôn ngữ
  if (lang === 'vi') {
    document.querySelector('.subtitle')?.textContent = 'Không có logo – Không có watermark';
    document.querySelector('button[type="submit"]')?.innerHTML = '<i class="fa fa-download"></i> Tải về';
    document.querySelector('input[type="text"]')?.placeholder = 'Dán link vào đây...';
  } else if (lang === 'id') {
    // giữ nguyên vì mặc định trang đã là id
  } else if (lang === 'en') {
    document.querySelector('.subtitle')?.textContent = 'No logo – No watermark';
    document.querySelector('button[type="submit"]')?.innerHTML = '<i class="fa fa-download"></i> Download';
    document.querySelector('input[type="text"]')?.placeholder = 'Paste link...';
  }

  // Ẩn phần header-controls nếu đang trong app
  if (isInApp) {
    const header = document.querySelector('.header-controls');
    if (header) header.remove(); // hoặc header.style.display = 'none';
  }
})();
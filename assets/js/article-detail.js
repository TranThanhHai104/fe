var params = new URLSearchParams(window.location.search);
var rssUrl = params.get("rss");
var index = params.get("id");

if (!rssUrl || index === null) {
    document.body.innerHTML = "<div style='text-align:center; padding: 50px;'><h2>⚠️ Lỗi: Thiếu bài viết.</h2></div>";
} else {
    document.getElementById("content").innerHTML = "<p class='loading'>🔄 Đang tải nội dung...</p>";

    fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl))
        .then(res => res.json())
        .then(data => {
            var item = data.items[index];
            if (!item) throw new Error("Không tìm thấy bài viết");

            // 1. Hiển thị bài viết
            document.getElementById("title").innerText = item.title;
            document.getElementById("date").innerText = "📅 " + new Date(item.pubDate).toLocaleString('vi-VN');
            document.getElementById("sourceLink").href = item.link;
            if (item.enclosure?.link) {
                document.getElementById("image").src = item.enclosure.link;
                document.getElementById("image").style.display = "block";
            }

            // 2. Kích hoạt và Hiện bình luận cũ
            const cusdisThread = document.getElementById('cusdis_thread');
            if (cusdisThread) {
                // Tạo ID bài viết CỐ ĐỊNH (Không dùng btoa để tránh lỗi ký tự)
                const safeId = encodeURIComponent(rssUrl).substring(0, 30) + "_" + index;

                cusdisThread.setAttribute('data-page-id', safeId);
                cusdisThread.setAttribute('data-page-url', window.location.href);
                cusdisThread.setAttribute('data-page-title', item.title);

                // Nạp script Cusdis sau khi đã gán xong ID
                if (!document.getElementById('cusdis-script')) {
                    const script = document.createElement('script');
                    script.id = 'cusdis-script';
                    script.src = 'https://cusdis.com/js/cusdis.es.js';
                    script.async = true;
                    script.onload = () => {
                        if (window.renderCusdis) window.renderCusdis(cusdisThread);
                    };
                    document.body.appendChild(script);
                } else if (window.renderCusdis) {
                    window.renderCusdis(cusdisThread);
                }
            }

            // 3. Fetch nội dung chi tiết
            return fetch(`http://localhost:3000/api/crawl?url=${encodeURIComponent(item.link)}`);
        })
        .then(res => res.json())
        .then(result => {
            const contentDiv = document.getElementById("content");
            if (result?.success) {
                contentDiv.innerHTML = `<div class="full-article-content">${result.content}</div>`;
            } else {
                contentDiv.innerHTML = `<p>Lỗi: ${result.error}</p>`;
            }
        })
        .catch(err => {
            console.error(err);
        });
}
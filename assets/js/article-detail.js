var params = new URLSearchParams(window.location.search);
var rssUrl = params.get("rss");
var index = params.get("id");

if (!rssUrl || index === null) {
    document.body.innerHTML = "<div style='text-align:center; padding: 50px;'><h2>⚠️ Lỗi: Thiếu tham số bài viết.</h2><a href='index.html'>Quay lại trang chủ</a></div>";
} else {
    document.getElementById("content").innerHTML = "<p class='loading'>🔄 Đang tải nội dung bài viết...</p>";

    var rssApi = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);

    fetch(rssApi)
        .then(res => res.json())
        .then(data => {
            var item = data.items[index];
            if (!item) throw new Error("Không tìm thấy bài viết trong danh sách RSS");

            document.getElementById("title").innerText = item.title;
            document.getElementById("date").innerText = "📅 " + new Date(item.pubDate).toLocaleString('vi-VN');
            document.getElementById("sourceLink").href = item.link;

            if (item.enclosure && item.enclosure.link) {
                document.getElementById("image").src = item.enclosure.link;
                document.getElementById("image").style.display = "block";
            } else {
                document.getElementById("image").style.display = "none";
            }

            const crawlApi = `http://localhost:3000/api/crawl?url=${encodeURIComponent(item.link)}`;

            return fetch(crawlApi);
        })
        .then(res => res.json())
        .then(result => {
            const contentDiv = document.getElementById("content");

            if (result && result.success === true) {
                contentDiv.innerHTML = `
                    <div class="full-article-content">
                        ${result.content}
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `
                    <div class="error-msg" style="padding: 20px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px;">
                        <p style="color: #c53030; font-weight: bold;">❌ Không thể lấy nội dung chi tiết.</p>
                        <p>Lý do: ${result.error || "Cơ chế chặn bot hoặc cấu trúc bài báo lạ"}</p>
                        <a href="${document.getElementById("sourceLink").href}" target="_blank" class="read-more-btn" style="color: #3182ce; text-decoration: underline;">Đọc bài gốc tại VietnamNet</a>
                    </div>
                `;
            }
        })
        .catch(err => {
            document.getElementById("content").innerHTML = `
                <div style="text-align:center; padding: 20px; border: 2px dashed #cbd5e0;">
                    <p>🔌 <b>Lỗi kết nối:</b> ${err.message}</p>
                    <p>Hãy đảm bảo bạn đã chạy lệnh <code>node server.js</code></p>
                    <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top:10px; cursor: pointer;">Thử lại</button>
                </div>
            `;
            console.error("Error detail:", err);
        });
}
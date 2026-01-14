document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const rssUrl = urlParams.get('rss');
    const title = urlParams.get('title') || 'Tin tức';

    document.getElementById("category-title").innerText = title;

    if (!rssUrl) {
        document.getElementById("loader").innerHTML = "Lỗi: Không tìm thấy chuyên mục!";
        return;
    }

    const proxyApi = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    fetch(proxyApi)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "ok") throw new Error("RSS Error");

            const grid = document.getElementById("news-grid");
            const loader = document.getElementById("loader");
            loader.style.display = "none";

            data.items.forEach((item, index) => {
                let thumb = 'https://via.placeholder.com/400x250?text=No+Image';

                if (item.enclosure && item.enclosure.link) {
                    thumb = item.enclosure.link;
                }
                else if (item.thumbnail) {
                    thumb = item.thumbnail;
                }
                else if (item.description && item.description.includes("<img")) {
                    const match = item.description.match(/<img[^>]+src="([^">]+)"/);
                    if (match && match[1]) {
                        thumb = match[1];
                    }
                }

                thumb = thumb.replace(/[_-]\d+x\d+(\.\w+)$/, "$1");
                thumb = thumb.replace(/\/w\d+\//, "/");

                const pubDate = new Date(item.pubDate).toLocaleString('vi-VN');
                const detailLink = `article-detail.html?rss=${encodeURIComponent(rssUrl)}&id=${index}`;

                let shortDesc = "Đang cập nhật nội dung...";
                if (item.description) {
                    const textOnly = item.description
                        .replace(/<[^>]*>/g, "")
                        .replace(/\s+/g, " ")
                        .trim();

                    shortDesc = textOnly.length > 120
                        ? textOnly.substring(0, 120) + "..."
                        : textOnly;
                }

                const cardHtml = `
                    <li class="news-item">
                        <a href="${detailLink}">
                            <div class="thumb-container">
                                <img src="${thumb}" 
                                     alt="${item.title}"
                                     loading="lazy"
                                     onerror="this.onerror=null;this.src='https://via.placeholder.com/400x250?text=Error+Loading'">
                            </div>
                            <div class="news-info">
                                <h3>${item.title}</h3>
                                <p class="date"> ${pubDate}</p>
                                <p class="desc">${shortDesc}</p>
                            </div>
                        </a>
                    </li>
                `;

                grid.insertAdjacentHTML('beforeend', cardHtml);
            });
        })
        .catch(error => {
            console.error(error);
            document.getElementById("loader").innerHTML = "Lỗi tải tin tức.";
        });
});
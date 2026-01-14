import { renderNav } from "./modules/nav.js";

const vietnamnetFeeds = [
    { nid: "ds", title: "Đời sống", url: "https://infonet.vietnamnet.vn/rss/doi-song.rss" },
    { nid: "tt", title: "Thị trường", url: "https://infonet.vietnamnet.vn/rss/thi-truong.rss" },
    { nid: "tg", title: "Thế giới", url: "https://infonet.vietnamnet.vn/rss/the-gioi.rss" },
    { nid: "gd", title: "Gia đình", url: "https://infonet.vietnamnet.vn/rss/gia-dinh.rss" },
    { nid: "gt", title: "Giới trẻ", url: "https://infonet.vietnamnet.vn/rss/gioi-tre.rss" },
    { nid: "kd", title: "Khỏe - Đẹp", url: "https://infonet.vietnamnet.vn/rss/khoe-dep.rss" },
    { nid: "cl", title: "Chuyện lạ", url: "https://infonet.vietnamnet.vn/rss/chuyen-la.rss" },
    { nid: "qs", title: "Quân sự", url: "https://infonet.vietnamnet.vn/rss/quan-su.rss" }
];

includeHTML('header-id', 'templates/header.html', function () {
    document.getElementById("btn-login")?.addEventListener("click", openAuth);
});
includeHTML('footer-id', 'templates/footer.html');
includeHTML('nav-id', 'templates/nav.html', function () {
    renderNav(vietnamnetFeeds);
});

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
}

function getThumb(item) {
    let thumb = 'https://via.placeholder.com/400x250?text=No+Image';

    if (item.enclosure?.link) thumb = item.enclosure.link;
    else if (item.thumbnail) thumb = item.thumbnail;
    else if (item.description && item.description.includes("<img")) {
        const m = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (m && m[1]) thumb = m[1];
    }

    return thumb;
}

function createItemHtml(item, rssUrl, index) {
    const pubDate = formatDate(item.pubDate);
    const detailLink = `article-detail.html?rss=${encodeURIComponent(rssUrl)}&id=${index}`;
    const thumb = getThumb(item);

    return `
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
                    <p class="date">${pubDate}</p>
                </div>
            </a>
        </li>
    `;
}
document.addEventListener("DOMContentLoaded", function () {
    const authBox = document.getElementById("authBox");
    const btnClose = document.getElementById("btnClose");

    if (btnClose && authBox) {
        btnClose.onclick = function (e) {
            e.preventDefault();
            authBox.style.display = "none";
        };
    }

    const tabs = document.querySelectorAll(".tabs a");
    tabs.forEach(tab => {
        tab.onclick = function (e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
        };
    });
});
document.addEventListener("DOMContentLoaded", async function () {
    const mainContainer = document.getElementById("news-container");

    if (!mainContainer) {
        console.error("Không tìm thấy #news-container");
        return;
    }

    mainContainer.innerHTML = `
        <div class="category-box">
            <h2 class="category-title">Tin mới nhất</h2>
            <ul id="news-grid" class="news-grid"></ul>
            <div id="home-loader" class="loader">Đang tải tin...</div>
        </div>
    `;

    const grid = document.getElementById("news-grid");
    const loader = document.getElementById("home-loader");

    let allItems = [];

    try {
        const requests = vietnamnetFeeds.map(feed => {
            const api = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
            return fetch(api)
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.items) {
                        data.items.forEach((item, idx) => {
                            allItems.push({
                                ...item,
                                _rssUrl: feed.url,
                                _index: idx
                            });
                        });
                    }
                });
        });

        await Promise.all(requests);

        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        loader.style.display = "none";

        allItems.slice(0, 12).forEach(item => {
            const html = createItemHtml(item, item._rssUrl, item._index);
            grid.insertAdjacentHTML("beforeend", html);
        });

    } catch (err) {
        console.error(err);
        loader.innerText = "Lỗi tải dữ liệu.";
    }
});

import { vietnamnetFeeds } from "./main.js";

async function handleSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || "";

    const displayKeyword = document.getElementById('keyword-display');
    const countResults = document.getElementById('count-results');
    const loader = document.getElementById('home-loader');
    const mainContainer = document.getElementById("list-articles");

    if (displayKeyword) displayKeyword.innerText = query;
    if (!mainContainer) return;

    if (!query) {
        if (loader) loader.style.display = 'none';
        return;
    }

    let allItems = [];
    try {
        const requests = vietnamnetFeeds.map(feed => {
            const api = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
            return fetch(api).then(res => res.json()).then(data => {
                if (data.status === "ok") {
                    data.items.forEach((item, idx) => {
                        allItems.push({ ...item, _rssUrl: feed.url, _index: idx });
                    });
                }
            });
        });

        await Promise.all(requests);

        const results = allItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        if (loader) loader.style.display = 'none';
        if (countResults) countResults.innerText = results.length;

        mainContainer.innerHTML = "";

        results.forEach(item => {
            const div = document.createElement("div");
            div.className = "article-item";
            const detailLink = `article-detail.html?rss=${encodeURIComponent(item._rssUrl)}&id=${item._index}`;

            let thumb = 'https://via.placeholder.com/400x250?text=No+Image';
            if (item.enclosure?.link) thumb = item.enclosure.link;
            else if (item.thumbnail) thumb = item.thumbnail;
            else if (item.description && item.description.includes("<img")) {
                const m = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (m && m[1]) thumb = m[1];
            }

            const date = new Date(item.pubDate).toLocaleString('vi-VN');
            const cleanDesc = item.description.replace(/<[^>]*>?/gm, '').substring(0, 160);

            div.innerHTML = `
                <div class="article-thumb">
                    <a href="${detailLink}"><img src="${thumb}" onerror="this.src='https://via.placeholder.com/400x250'"></a>
                </div>
                <div class="article-info">
                    <h3><a href="${detailLink}">${item.title}</a></h3>
                    <p>${cleanDesc}...</p>
                    <span class="date">${date}</span>
                </div>
            `;
            mainContainer.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        if (loader) loader.innerText = "Lỗi tải dữ liệu.";
    }
}

document.addEventListener("DOMContentLoaded", handleSearchPage);
const handleRouting = () => {
    const mainContent = document.getElementById("news-container");
    const hashPath = window.location.hash.substring(1) || 'home';
    const [path, queryString] = hashPath.split('?');
    const params = new URLSearchParams(queryString);
    const rssUrl = params.get('rss');

    if (path === 'home' || path === '') {
        mainContent.innerHTML = `<section class="container"><h1>Trang Chủ</h1><p>Chào mừng bạn!</p></section>`;
    }
    else if (path.startsWith('category/')) {
        const title = path.split('/')[1].replace(/-/g, ' ').toUpperCase();
        mainContent.innerHTML = `
            <div class="container">
                <h1>${title}</h1>
                <div id="loader">Đang tải...</div>
                <ul id="news-grid" class="news-grid"></ul>
            </div>`;
        if (rssUrl) fetchNewsByUrl(rssUrl);
    }
    else if (path.startsWith('article/')) {
        const id = path.split('/')[1];
        mainContent.innerHTML = `
            <div class="container">
                <h1>Chi tiết bài viết</h1>
                <div id="article-detail-content">Đang tải nội dung...</div>
                <button onclick="window.history.back()">Quay lại</button>
            </div>`;
    }
};

const fetchNewsByUrl = (rssUrl) => {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById("news-grid");
            const loader = document.getElementById("loader");
            if (loader) loader.style.display = "none";

            data.items.forEach((item, index) => {
                grid.insertAdjacentHTML('beforeend', `
                    <li class="news-item">
                        <a href="#article/${index}?rss=${encodeURIComponent(rssUrl)}">
                            <div class="thumb-container">
                                <img src="${item.thumbnail || 'https://via.placeholder.com/200x130'}">
                            </div>
                            <div class="news-info">
                                <h3>${item.title}</h3>
                                <p>${item.description.replace(/<[^>]*>/g, "").substring(0, 120)}...</p>
                            </div>
                        </a>
                    </li>`);
            });
        });
};

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);
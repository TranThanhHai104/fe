
const vietnamnetFeeds = [
    {
        nid: "ds",
        title: "Đời sống",
        url: "https://infonet.vietnamnet.vn/rss/doi-song.rss"
    },
    {
        nid: "tt",
        title: "Thị trường",
        url: "https://infonet.vietnamnet.vn/rss/thi-truong.rss"
    },
    {
        nid: "tg",
        title: "Thế giới",
        url: "https://infonet.vietnamnet.vn/rss/the-gioi.rss"
    },
    {
        nid: "gd",
        title: "Gia đình",
        url: "https://infonet.vietnamnet.vn/rss/gia-dinh.rss"
    },
    {
        nid: "gt",
        title: "Giới trẻ",
        url: "https://infonet.vietnamnet.vn/rss/gioi-tre.rss"
    },
    {
        nid: "kd",
        title: "Khỏe - Đẹp",
        url: "https://infonet.vietnamnet.vn/rss/khoe-dep.rss"
    },
    {
        nid: "cl",
        title: "Chuyện lạ",
        url:"https://infonet.vietnamnet.vn/rss/chuyen-la.rss"
    },
    {
        nid: "qs",
        title: "Quân sự",
        url:"https://infonet.vietnamnet.vn/rss/quan-su.rss"
    }
];

function formatDate(dateString) {
    const date = new Date(dateString);
    const timePart = date.toLocaleTimeString();
    const datePart = date.toLocaleDateString();
    return timePart + " " + datePart;
}

function createArticleHtml(item) {
    const imageUrl = item.enclosure.link || 'https://via.placeholder.com/150';
    const formattedDate = formatDate(item.pubDate);

    return `
        <li class="news-item">
            <a href="${item.link}" target="_blank"> 
                <img src="${imageUrl}" alt="${item.title}" class="news-thumb">
                <div class="news-info">
                    <h3>${item.title}</h3>
                    <p class="pub-date">${formattedDate}</p>
                </div>
            </a>
        </li>
    `;
}

function createCategoryHtml(category, articles) {
    let htmlContent = `<h2 class="category-title">${category}</h2>`;
    htmlContent += '<ul class="news-list">';

    if (articles && articles.length > 0) {
        articles.slice(0, 6).forEach(function(item) {
            htmlContent += createArticleHtml(item);
        });
    } else {
        htmlContent += '<li>Không có bài viết nào để hiển thị.</li>';
    }

    htmlContent += '</ul>';
    return htmlContent;
}

function fetchAndRender(url, nid, category) {
    const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url);
    const container = document.getElementById(nid);
    container.innerHTML = `<h2 class="category-title">${category}</h2><p class="loading-msg">Đang tải dữ liệu...</p>`;

    fetch(proxyUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Lỗi HTTP! Trạng thái: " + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            const articles = data.items;
            const finalHtml = createCategoryHtml(category, articles);
            container.innerHTML = finalHtml;
        })
        .catch(function(error) {
            console.error("Lỗi khi tải dữ liệu cho " + category + ":", error);
            container.innerHTML = `<h2 class="category-title">${category}</h2><p class="error-msg">Không thể tải dữ liệu.</p>`;
        });
}
document.addEventListener('DOMContentLoaded', function() {
    const mainContainer = document.getElementById('news-container');

    if (!mainContainer) {
        console.error("Không tìm thấy phần tử #news-container. Vui lòng kiểm tra HTML.");
        return;
    }
    vietnamnetFeeds.forEach(function(feed) {
        const section = document.createElement('section');
        section.id = feed.nid;
        section.classList.add('news-category');
        mainContainer.appendChild(section);

        fetchAndRender(feed.url, feed.nid, feed.title);
    });
});
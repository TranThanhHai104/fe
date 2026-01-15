export function renderNav(feeds) {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    navList.innerHTML = `<li><a href="index.html" class="active">Home</a></li>`;

    feeds.forEach(feed => {
        const li = document.createElement("li");
        const categoryLink = `category.html?rss=${encodeURIComponent(feed.url)}&title=${encodeURIComponent(feed.title)}`;
        li.innerHTML = `<a href="${categoryLink}">${feed.title}</a>`;
        navList.appendChild(li);
    });
}
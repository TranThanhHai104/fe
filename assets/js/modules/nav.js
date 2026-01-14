export function renderNav(feeds) {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const lastLi = navList.lastElementChild;

    while (navList.firstChild && navList.firstChild !== lastLi) {
        navList.removeChild(navList.firstChild);
    }

    feeds.forEach(feed => {
        const li = document.createElement("li");

        const categoryLink = `category.html?rss=${encodeURIComponent(feed.url)}&title=${encodeURIComponent(feed.title)}`;

        li.innerHTML = `<a href="${categoryLink}">${feed.title}</a>`;

        if (lastLi) {
            navList.insertBefore(li, lastLi);
        } else {
            navList.appendChild(li);
        }
    });
}
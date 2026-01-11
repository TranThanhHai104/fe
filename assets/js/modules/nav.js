export function renderNav(feeds) {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const lastLi = navList.lastElementChild;

    while (navList.firstChild && navList.firstChild !== lastLi) {
        navList.removeChild(navList.firstChild);
    }

    feeds.forEach(feed => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#${feed.nid}"> ${feed.title}</a>`;
        if (lastLi) {
            navList.insertBefore(li, lastLi);
        } else {
            navList.appendChild(li);
        }
    });
}

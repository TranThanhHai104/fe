function includeHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            const el = document.getElementById(elementId);
            if (el) {
                el.innerHTML = data;
                if (callback) callback();
            }
        })
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    includeHTML("header-id", "templates/header.html", function () {
        const nut = document.getElementById("theme-toggle");
        const text = document.getElementById("theme-icon");
        if (nut && text) {
            text.innerText = document.body.classList.contains("dark-mode") ? "Sáng" : "Tối";
            nut.addEventListener("click", function () {
                document.body.classList.toggle("dark-mode");
                const isDark = document.body.classList.contains("dark-mode");
                localStorage.setItem("theme", isDark ? "dark" : "light");
                text.innerText = isDark ? "Sáng" : "Tối";
            });
        }

        const btnLogin = document.getElementById("btn-login");
        if (btnLogin && typeof openAuth === "function") {
            btnLogin.addEventListener("click", openAuth);
        }

        const headerInput = document.getElementById("search-input");
        const headerBtn = document.getElementById("search-submit");
        if (headerInput && headerBtn) {
            const doSearch = () => {
                const val = headerInput.value.trim();
                if (val) window.location.href = `search.html?q=${encodeURIComponent(val)}`;
            };
            headerBtn.onclick = doSearch;
            headerInput.onkeypress = (e) => { if (e.key === "Enter") doSearch(); };
        }
    });

    includeHTML("footer-id", "templates/footer.html");
});
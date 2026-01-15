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

function initSearch() {
    const headerInput = document.getElementById("search-input");
    const headerBtn = document.getElementById("search-submit");

    if (headerInput && headerBtn) {
        const doSearch = () => {
            const val = headerInput.value.trim();
            if (val) {
                window.location.href = `search.html?q=${encodeURIComponent(val)}`;
            }
        };

        headerBtn.onclick = doSearch;
        headerInput.onkeypress = (e) => {
            if (e.key === "Enter") doSearch();
        };
    }
}

document.addEventListener("click", function(e) {
    const loginBtn = e.target.closest("#btn-login");
    if (!loginBtn) return;
    const userNickname = localStorage.getItem('user_nickname');
    if (userNickname) {
        if (confirm("Bạn có muốn đăng xuất?")) {
            localStorage.removeItem('user_nickname');
            localStorage.removeItem('user_email');
            location.reload();
        }
    } else {
        if (typeof window.openAuth === "function") window.openAuth();
        else alert("Hệ thống đang khởi tạo...");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    includeHTML("header-id", "templates/header.html", function () {
        initSearch();

        const userNickname = localStorage.getItem('user_nickname');
        const loginBtn = document.getElementById("btn-login");
        if (loginBtn && userNickname) {
            const textSpan = loginBtn.querySelector(".vnnclientid-login-text");
            if (textSpan) textSpan.innerText = "Đăng xuất";
        }

        const nut = document.getElementById("theme-toggle");
        if (nut) {
            nut.onclick = function() {
                document.body.classList.toggle("dark-mode");
                const isDark = document.body.classList.contains("dark-mode");
                localStorage.setItem("theme", isDark ? "dark" : "light");
            };
        }
    });

    includeHTML("nav-id", "templates/nav.html");
    includeHTML("footer-id", "templates/footer.html");
});
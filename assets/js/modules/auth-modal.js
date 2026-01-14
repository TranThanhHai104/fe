window.openAuth = function() {
    fetch("templates/auth-modal.html")
        .then(res => {
            if (!res.ok) throw new Error();
            return res.text();
        })
        .then(data => {
            const container = document.getElementById("auth-container");
            if (container) {
                container.innerHTML = data;
                setTimeout(() => {
                    window.showForm("login");
                }, 10);
            }
        })
        .catch(err => console.error(err));
};

window.closeAuth = function() {
    const container = document.getElementById("auth-container");
    if (container) container.innerHTML = "";
};

window.showForm = function(id) {
    const forms = ["login", "register", "forgot"];
    forms.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.style.display = "none";
    });
    const target = document.getElementById(id);
    if (target) target.style.display = "block";
};

document.addEventListener("click", function(e) {
    if (e.target.closest("#btn-login")) {
        window.openAuth();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeAuth();
});
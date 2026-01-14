function includeHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback();
        });
}
function includeHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback();
        });
}

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
    //load header truoc
    includeHTML("header-id", "templates/header.html", function () {
        let nut = document.getElementById("theme-toggle");
        let text = document.getElementById("theme-icon");

        if (!nut || !text) return;

        text.innerText = document.body.classList.contains("dark-mode") ? "Sáng" : "Tối";

        nut.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("theme", "dark");
                text.innerText = "Sáng";
            } else {
                localStorage.setItem("theme", "light");
                text.innerText = "Tối";
            }
        });
    });
});
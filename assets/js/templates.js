function includeHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback();
        });
}

includeHTML('header-id', 'templates/header.html', function () {
    document
        .getElementById("btn-login")
        .addEventListener("click", openAuth);
});

includeHTML('footer-id', 'templates/footer.html');

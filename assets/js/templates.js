function includeHTML(elementId, filePath) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        });
}

includeHTML('header-id', 'templates/header.html');
includeHTML('footer-id', 'templates/footer.html');
function includeHTML(elementId, filePath, callback) {
    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (callback) callback();
        });
}



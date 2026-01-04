function openAuth() {
    fetch("templates/auth-modal.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("auth-container").innerHTML = data;

            showForm("login");
        });
}


function showForm(id) {
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
    document.getElementById("forgot").style.display = "none";

    document.getElementById(id).style.display = "block";
}

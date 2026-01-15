import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC3_44rzuSrnnQ3g2FdRhpt-mAEkvVvYes",
    authDomain: "mynews-78b49.firebaseapp.com",
    projectId: "mynews-78b49",
    storageBucket: "mynews-78b49.firebasestorage.app",
    messagingSenderId: "174202480228",
    appId: "1:174202480228:web:e43d61926125111d58e171",
    measurementId: "G-86S1X4B0X5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();

window.loginWithGithub = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            localStorage.setItem('user_nickname', user.displayName || user.reloadUserInfo.screenName || "User");
            localStorage.setItem('user_email', user.email || (user.uid + "@github.com"));
            location.reload();
        })
        .catch((error) => {
            console.error(error);
            alert("Lỗi: " + error.message);
        });
};

window.logout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem('user_nickname');
        localStorage.removeItem('user_email');
        location.reload();
    }).catch((error) => {
        console.error(error);
    });
};

window.openAuth = function() {
    fetch("templates/auth-modal.html")
        .then(res => res.ok ? res.text() : Promise.reject())
        .then(data => {
            let container = document.getElementById("auth-container");

            if (!container) {
                container = document.createElement("div");
                container.id = "auth-container";
                document.body.appendChild(container);
            }

            container.innerHTML = data;
            container.style.display = "flex";
            setTimeout(() => window.showForm("login"), 10);
        })
        .catch(err => {
            console.error("Không nạp được file templates/auth-modal.html:", err);
            alert("Lỗi hệ thống: Không tìm thấy giao diện đăng nhập.");
        });
};

window.closeAuth = function() {
    const container = document.getElementById("auth-container");
    if (container) {
        container.innerHTML = "";
        container.style.display = "none";
    }
};

window.showForm = function(id) {
    const forms = ["login", "register", "forgot"];
    forms.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.style.display = (f === id) ? "block" : "none";
    });
};

document.addEventListener("click", function(e) {
    if (e.target.id === "auth-container") {
        window.closeAuth();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeAuth();
});
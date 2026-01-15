import { renderNav } from "./modules/nav.js";

const vietnamnetFeeds = [
    { nid: "ds", title: "Đời sống", url: "https://infonet.vietnamnet.vn/rss/doi-song.rss" },
    { nid: "tt", title: "Thị trường", url: "https://infonet.vietnamnet.vn/rss/thi-truong.rss" },
    { nid: "tg", title: "Thế giới", url: "https://infonet.vietnamnet.vn/rss/the-gioi.rss" },
    { nid: "gd", title: "Gia đình", url: "https://infonet.vietnamnet.vn/rss/gia-dinh.rss" },
    { nid: "gt", title: "Giới trẻ", url: "https://infonet.vietnamnet.vn/rss/gioi-tre.rss" },
    { nid: "kd", title: "Khỏe - Đẹp", url: "https://infonet.vietnamnet.vn/rss/khoe-dep.rss" },
    { nid: "cl", title: "Chuyện lạ", url: "https://infonet.vietnamnet.vn/rss/chuyen-la.rss" },
    { nid: "qs", title: "Quân sự", url: "https://infonet.vietnamnet.vn/rss/quan-su.rss" }
];

var params = new URLSearchParams(window.location.search);
var rssUrl = params.get("rss");
var index = params.get("id");
const audioPlayer = document.getElementById("tts-audio");

setTimeout(() => { renderNav(vietnamnetFeeds); }, 500);

if (!rssUrl || index === null) {
    document.body.innerHTML = "<div style='text-align:center; padding:50px'><h2>Lỗi: Thiếu bài viết.</h2></div>";
} else {
    document.getElementById("content").innerHTML = "<p class='loading'>Đang tải nội dung...</p>";
    fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl))
        .then(res => res.json())
        .then(data => {
            var item = data.items[index];
            if (!item) throw new Error("Không tìm thấy bài viết");
            document.getElementById("title").innerText = item.title;
            document.getElementById("date").innerText = new Date(item.pubDate).toLocaleString("vi-VN");
            document.getElementById("sourceLink").href = item.link;

            const cusdisThread = document.getElementById('cusdis_thread');
            if (cusdisThread) {
                const pageId = btoa(item.link).substring(0, 20);
                cusdisThread.setAttribute('data-page-id', pageId);
                cusdisThread.setAttribute('data-page-url', window.location.href);
                cusdisThread.setAttribute('data-page-title', item.title);
                if (window.renderCusdis) window.renderCusdis(cusdisThread);
            }

            if (item.enclosure && item.enclosure.link) {
                document.getElementById("image").src = item.enclosure.link;
                document.getElementById("image").style.display = "block";
            }
            return fetch(`http://localhost:3000/api/crawl?url=${encodeURIComponent(item.link)}`);
        })
        .then(res => res.json())
        .then(result => {
            const contentDiv = document.getElementById("content");
            contentDiv.innerHTML = result.success ? `<div class="full-article-content">${result.content}</div>` : `<p>Lỗi: ${result.error}</p>`;
        })
        .catch(err => console.error("Lỗi:", err));
}

async function handleSpeak() {
    const btnPlay = document.getElementById("btn-play");
    if (audioPlayer.src && audioPlayer.paused && audioPlayer.currentTime > 0) {
        audioPlayer.play();
        updateUI("playing");
        return;
    }
    const title = document.getElementById("title")?.innerText || "";
    const content = document.getElementById("content")?.innerText || "";
    const text = (title + ". " + content).replace(/\s+/g, " ").trim().substring(0, 300);
    if (!text) return;
    try {
        btnPlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        const response = await fetch("http://localhost:3000/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (data.audioUrl) startAudioPoller(data.audioUrl);
        else resetBtns();
    } catch (error) {
        resetBtns();
    }
}

function startAudioPoller(url, attempt = 0) {
    audioPlayer.src = url;
    audioPlayer.load();
    const onCanPlay = () => {
        audioPlayer.playbackRate = parseFloat(document.getElementById("audio-speed").value);
        audioPlayer.play().then(() => updateUI("playing"));
        cleanup();
    };
    const onError = () => {
        cleanup();
        if (attempt < 20) setTimeout(() => startAudioPoller(url, attempt + 1), 2000);
        else resetBtns();
    };
    const cleanup = () => {
        audioPlayer.removeEventListener('canplaythrough', onCanPlay);
        audioPlayer.removeEventListener('error', onError);
    };
    audioPlayer.addEventListener('canplaythrough', onCanPlay);
    audioPlayer.addEventListener('error', onError);
}

function updateUI(state) {
    document.getElementById("btn-play").style.display = "none";
    document.getElementById("btn-pause").style.display = state === "playing" ? "inline-block" : "none";
    document.getElementById("btn-resume").style.display = state === "paused" ? "inline-block" : "none";
    document.getElementById("btn-stop").style.display = "inline-block";
}

function resetBtns() {
    document.getElementById("btn-play").style.display = "inline-block";
    document.getElementById("btn-play").innerHTML = '<i class="fas fa-play"></i>';
    ["btn-pause", "btn-resume", "btn-stop"].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).style.display = "none";
    });
}

audioPlayer.onended = resetBtns;
document.getElementById("audio-speed").onchange = (e) => audioPlayer.playbackRate = parseFloat(e.target.value);
document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.id === "btn-play") handleSpeak();
    if (btn.id === "btn-pause") { audioPlayer.pause(); updateUI("paused"); }
    if (btn.id === "btn-resume") { audioPlayer.play(); updateUI("playing"); }
    if (btn.id === "btn-stop") { audioPlayer.pause(); audioPlayer.currentTime = 0; resetBtns(); }
});
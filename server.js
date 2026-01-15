import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API TTS: Chuyển văn bản thành giọng nói qua FPT AI v5
app.post("/api/tts", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, error: "Nội dung trống" });

        const FPT_API_KEY = "Jgk2fCzrACvspSniZn9o3ijWC209h3ho";

        const response = await axios.post("https://api.fpt.ai/hmi/tts/v5", text, {
            headers: {
                "api-key": FPT_API_KEY,
                "speed": "",
                "voice": "banmai",
                "Content-Type": "text/plain"
            }
        });

        if (response.data && response.data.async) {
            console.log("Link MP3 được khởi tạo:", response.data.async);
            res.json({ success: true, audioUrl: response.data.async });
        } else {
            res.status(500).json({ success: false, error: "FPT không phản hồi link" });
        }
    } catch (err) {
        console.error("Lỗi FPT:", err.response ? err.response.data : err.message);
        res.status(500).json({ success: false, error: "Lỗi Server TTS" });
    }
});

// API Crawl: Lấy nội dung chi tiết bài báo
app.get("/api/crawl", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.json({ success: false, error: "Thiếu URL" });
    try {
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://vietnamnet.vn/" },
            timeout: 10000
        });
        const dom = new JSDOM(response.data, { url });
        const reader = new Readability(dom.window.document);
        let article = reader.parse();
        let content = article ? article.content : "";
        if (!content) {
            const $ = cheerio.load(response.data);
            content = $(".maincontent").html() || $(".content-detail").html();
        }
        const $clean = cheerio.load(content);
        $clean(".vnn-content-related, .insert-video, script, style").remove();
        res.json({ success: true, content: $clean.html() });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
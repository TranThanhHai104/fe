import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const app = express();
app.use(cors());

app.get("/api/crawl", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.json({ success: false, error: "Thiếu url" });

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Referer": "https://vietnamnet.vn/"
            },
            timeout: 20000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        let article = reader.parse();

        let finalContent = article ? article.content : "";

        if (!finalContent || finalContent.length < 500) {
            const specialSelectors = [
                ".content-detail",
                ".maincontent",
                "#vnn-content-body",
                ".vnn-detail-main-content",
                ".post-content"
            ];

            for (let selector of specialSelectors) {
                const el = $(selector);
                if (el.length > 0) {
                    finalContent = el.html();
                    break;
                }
            }
        }

        if (!finalContent) {
            return res.json({ success: false, error: "Không tìm thấy nội dung bài viết" });
        }

        const $clean = cheerio.load(finalContent);

        $clean(".vnn-content-related, .insert-video, .article-relate, script, style, .vnn-ad").remove();

        $clean('img').each((i, el) => {
            const $img = $clean(el);
            const src = $img.attr('data-src') || $img.attr('data-original') || $img.attr('src');
            if (src) {
                $img.attr('src', src);
                $img.removeAttr('data-src').removeAttr('data-original').removeAttr('srcset');
            }
            $img.css({'max-width': '100%', 'height': 'auto', 'display': 'block', 'margin': '15px auto'});
        });

        res.json({
            success: true,
            content: $clean.html()
        });

    } catch (err) {
        res.json({ success: false, error: "Lỗi Server: " + err.message });
    }
});

app.listen(3000, () => console.log("🚀 Server Crawler (Fix BAT) đang chạy tại http://localhost:3000"));
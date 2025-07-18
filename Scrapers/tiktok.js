const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches video and audio download links from a TikTok URL using SSSTik
 * @param {string} tiktokUrl - The TikTok video URL
 * @returns {Promise<{ success: boolean, videoUrl: string|null, audioUrl: string|null, links: string[] }>}
 */
async function fetchTikTokMedia(tiktokUrl) {
  try {
    const form = new URLSearchParams();
    form.append("id", tiktokUrl);
    form.append("locale", "en");
    form.append("tt", "QkZ3dnE5"); // static or dynamic depending on sssTik behavior

    const { data: html } = await axios.post("https://ssstik.io/abc", form, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://ssstik.io",
        "referer": "https://ssstik.io/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);
    const links = [];

    $("a[href^='https://tikcdn.io/ssstik/']").each((_, el) => {
      const link = $(el).attr("href");
      if (link) links.push(link);
    });

    return {
      success: links.length > 0,
      videoUrl: links[0] || null,
      audioUrl: links[1] || null,
      links,
    };
  } catch {
    return {
      success: false,
      videoUrl: null,
      audioUrl: null,
      links: [],
    };
  }
}

module.exports = fetchTikTokMedia;
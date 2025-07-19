
const axios = require("axios");
const qs = require("qs");

/**
 * Fetches metadata from TikSave (title, audio, HD video)
 * @param {string} videoUrl - The TikTok video URL
 * @returns {Promise<{success: boolean, title?: string, mp3?: string, mp4?: string, error?: string}>}
 */
async function fetchTikTokInfo(videoUrl) {
  try {
    const payload = qs.stringify({ q: videoUrl });
    const headers = {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://tiksave.io",
      Pragma: "no-cache",
      Referer: "https://tiksave.io/en",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
    };

    const res = await axios.post("https://tiksave.io/api/ajaxSearch", payload, { headers });
    const json = res.data;

    if (!json.status || !json.data) {
      return { success: false, error: "Invalid response from TikSave" };
    }

    const { title, music, hdplay } = json.data;
    return {
      success: true,
      title,
      mp3: music,
      mp4: hdplay,
    };
  } catch (err) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

module.exports = fetchTikTokInfo;
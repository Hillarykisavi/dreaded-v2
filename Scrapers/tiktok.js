const axios = require("axios");

/**
 * Fetches TikTok video metadata (title, video URL, etc.)
 * @param {string} url TikTok video URL
 * @returns {Promise<object|null>} Parsed metadata or null on failure
 */
async function fetchTikTokVideoInfo(url) {
  try {
    const response = await axios.post(
      "https://tikdl.io/api.php",
      {
        videolr1: url,
        videoUrl: url,
      },
      {
        headers: {
          Host: "tikdl.io",
          Connection: "keep-alive",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Origin: "https://tikdl.io",
          Pragma: "no-cache",
          Referer: "https://tikdl.io/",
          "Sec-Ch-Ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
          "Sec-Ch-Ua-Mobile": "?1",
          "Sec-Ch-Ua-Platform": '"Android"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0 Mobile Safari/537.36",
        },
      }
    );

    const data = response.data;
    if (!data || !data.success || !data.video_url) return null;

    return {
      title: data.title,
      author: data.author,
      duration: data.duration,
      views: data.views,
      video_url: data.video_url,
      audio_url: data.audio_url,
      thumbnail: data.thumbnail,
    };
  } catch {
    return null;
  }
}

module.exports = fetchTikTokVideoInfo;
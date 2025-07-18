const axios = require("axios");

/**
 * Fetches TikTok video metadata (title, video URL, audio URL, etc)
 * @param {string} url TikTok video URL
 * @returns {Promise<object>} Video metadata
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
          "Content-Type": "application/json",
          "Origin": "https://tikdl.io",
          "Referer": "https://tikdl.io/",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0 Mobile Safari/537.36",
        },
      }
    );

    const data = response.data;
    if (!data.success) return null;

    return {
      title: data.title,
      author: data.author,
      thumbnail: data.thumbnail,
      video_url: data.video_url,
      audio_url: data.audio_url,
      duration: data.duration,
      views: data.views,
    };
  } catch {
    return null;
  }
}

module.exports = { fetchTikTokVideoInfo };
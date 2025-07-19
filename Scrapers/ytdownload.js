const axios = require("axios");

const endpoint = "https://iloveyt.net/proxy.php";
async function ytdownload(videoUrl) {
  try {
    const res = await axios.post(endpoint, new URLSearchParams({ url: videoUrl }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const api = res.data;
    if (!api || !Array.isArray(api.mediaItems)) {
      return { mp3: null, mp4: null };
    }

    const audioItems = api.mediaItems.filter(
      item => item.mediaExtension?.toUpperCase() === "M4A"
    );
    const videoItems = api.mediaItems.filter(
      item => item.mediaExtension?.toUpperCase() === "MP4"
    );

    const audio128 = audioItems.find(item => item.mediaQuality === "128K");
    const video360 = videoItems.find(item => item.mediaRes === "640x360");

    let mp3 = null;
    let mp4 = null;

    if (audio128?.mediaUrl) {
      const r = await axios.get(audio128.mediaUrl);
      mp3 = r.data?.fileUrl || null;
    }

    if (video360?.mediaUrl) {
      const r = await axios.get(video360.mediaUrl);
      mp4 = r.data?.fileUrl || null;
    }

    return { mp3, mp4 };
  } catch {
    return { mp3: null, mp4: null };
  }
}

module.exports = ytdownload;
const dreaded = global.dreaded;
const cheerio = require('cheerio');
const yts = require("yt-search");
const fetch = require("node-fetch");
const acrcloud = require("acrcloud");
const fs = require("fs");
const FormData = require('form-data');
const path = require('path');
const axios = require("axios");
const fetchTikTokVideoInfo = require("../Scrapers/tiktok");

dreaded({
  pattern: "tikdl",
  desc: "TikTok video downloader",
  alias: ["tiktok"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m } = context;

  try {
    console.log("📥 tikdl command triggered");

    
    const hardcodedUrl = encodeURIComponent("https://www.tiktok.com/@the_4_jokers/video/7527471292782546190?_t=ZM-8y8oaADXmvY&_r=1/");
    console.log("🔗 Using hardcoded URL:", hardcodedUrl);

    let data;
    try {
      console.log("⏳ Attempting to fetch video metadata...");
      data = await fetchTikTokVideoInfo(decodeURIComponent(hardcodedUrl)); 
      console.log("✅ Fetched data:", data);

      if (!data || !data.video_url) {
        console.log("❌ No video_url in fetched data");
        return m.reply("❌ Failed to fetch TikTok video data. Try again.");
      }
    } catch (scraperError) {
      console.error("❌ Error while scraping:", scraperError);
      return m.reply("❌ An error occurred while scraping the TikTok data.");
    }

    const { title, author, video_url } = data;
    const caption = `🎬 *Title:* ${title}\n👤 *Author:* ${author}`;

    console.log("📤 Preparing to send video...");

    await m.reply("📥 Download started...");

    await client.sendMessage(m.chat, {
      video: { url: video_url },
      mimetype: "video/mp4",
      caption: caption
    }, { quoted: m });

    console.log("✅ Video sent successfully.");

  } catch (err) {
    console.error("❌ Unexpected error in tikdl:", err);
    m.reply(`❌ Error: ${err.message}`);
  }
});

dreaded({
  pattern: "alldl",
  desc: "Alldl command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, botname, fetchJson } = context;
  
  if (!text) return m.reply("Provide any link for download.\nE.g:- FB, X, tiktok, capcut etc");
  
  
  
  try {
  
  const data = await fetchJson(`https://api.dreaded.site/api/alldl?url=${text}`);
  
  
          if (!data || data.status !== 200 || !data.data || !data.data.videoUrl) {
              return m.reply("We are sorry but the API endpoint didn't respond correctly. Try again later.");
          }
  
  
  
  const allvid = data.data.videoUrl;
  
  await client.sendMessage(m.chat,{video : {url : allvid },caption : `Downloaded by ${botname}`,gifPlayback : false },{quoted : m}) 
  
  } catch (e) {
  
  m.reply("An error occured. API might be down\n" + e)
  
  }
});


dreaded({
  pattern: "apk",
  desc: "Apk command",
alias: ["app"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, fetchJson } = context;
  
  
  try {
  if (!text) return m.reply("Provide an app name");
  
  let data = await fetchJson (`https://bk9.fun/search/apk?q=${text}`);
          let dreaded = await fetchJson (`https://bk9.fun/download/apk?id=${data.BK9[0].id}`);
           await client.sendMessage(
                m.chat,
                {
                  document: { url: dreaded.BK9.dllink },
                  fileName: dreaded.BK9.name,
                  mimetype: "application/vnd.android.package-archive"}, { quoted: m });
  
  } catch (error) {
  
  m.reply("Apk download failed\n" + error)
  
  }
});


dreaded({
  pattern: "fbdl",
  desc: "Fbdl command",
alias: ["fb", "facebook"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, botname, fetchJson } = context;
  
      if (!text) {
          return m.reply("Provide a facebook link for the video");
      }
  
      if (!text.includes("facebook.com")) {
          return m.reply("That is not a facebook link.");
      }
  
      try {
                  let data = await fetchJson(`https://api.dreaded.site/api/facebook?url=${text}`);
  
  
          if (!data || data.status !== 200 || !data.facebook || !data.facebook.sdVideo) {
              return m.reply("We are sorry but the API endpoint didn't respond correctly. Try again later.");
          }
  
  
  
  
          const fbvid = data.facebook.sdVideo;
          const title = data.facebook.title;
  
  
          if (!fbvid) {
              return m.reply("Invalid facebook data. Please ensure the video exists.");
          }
  
          await client.sendMessage(
              m.chat,
              {
                  video: { url: fbvid },
                  caption: `${title}\n\nDownloaded by ${botname}`,
                  gifPlayback: false,
              },
              { quoted: m }
          );
      } catch (e) {
          console.error("Error occurred:", e);
          m.reply("An error occurred. API might be down. Error: " + e.message);
      }
});


dreaded({
  pattern: "gitclone",
  desc: "Gitclone command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text } = context;
  
  if (!text) return m.reply(`Where is the link?`)
  if (!text.includes('github.com')) return m.reply(`Is that a GitHub repo link ?!`)
  let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
      let [, user3, repo] = text.match(regex1) || []
      repo = repo.replace(/.git$/, '')
      let url = `https://api.github.com/repos/${user3}/${repo}/zipball`
      let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
      await client.sendMessage(m.chat, { document: { url: url }, fileName: filename+'.zip', mimetype: 'application/zip' }, { quoted: m }).catch((err) => m.reply("error"))
});


dreaded({
  pattern: "mediafire",
  desc: "Mediafire command",
alias: ["mf"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, botname  } = context;
  
  
  
  
  async function MediaFire(url, options) {
    try {
      let mime;
      options = options ? options : {};
      const res = await axios.get(url, options);
      const $ = cheerio.load(res.data);
      const hasil = [];
      const link = $('a#downloadButton').attr('href');
      const size = $('a#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace('                         ', '');
      const seplit = link.split('/');
      const nama = seplit[5];
      mime = nama.split('.');
      mime = mime[1];
      hasil.push({ nama, mime, size, link });
      return hasil;
    } catch (err) {
      return err;
    }
  }
  
  if (!text) return m.reply("provide mediafire link for download");
  
  if (!text.includes('mediafire.com')) {
          return m.reply(`Doesnt look like a mediafire link, uh?`);
      }
  
  
  await m.reply(`A moment...`);
  
  try {
  
          const fileInfo = await MediaFire(text);
  
  
  
  if (!fileInfo || !fileInfo.length) {
      return m.reply("Sorry, this file is no longer stored in mediafire.");
  }
  
  
  
  
  
  
          await client.sendMessage(
              m.chat,
              {
                  document: {
                      url: fileInfo[0].link,
                  },
                  fileName: fileInfo[0].nama,
                  mimetype: fileInfo[0].mime,
                  caption: `${fileInfo[0].nama} downloaded by ${botname}`, 
              },
              { quoted: m }
  
  
     );
  
  } catch (error) {
  
  
          m.reply(`An error occured:\n` + error);
      }
});


dreaded({
  pattern: "play",
  desc: "Play command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text } = context;
      
      
  
      if (!text) {
          return m.reply("Please provide a song name!");
      }
  
      try {
          const { videos } = await yts(text);
          if (!videos || videos.length === 0) {
              throw new Error("No songs found!");
          }
  
          const song = videos[0];
  
          const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${song.url}&format=mp3`, {
              method: 'GET',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                  'Accept': 'audio/mpeg'
              }
          });
  
          if (!response.ok) {
              throw new Error(`Download failed with status ${response.status}`);
          }
  
          await m.reply(`_Downloading ${song.title}_`);
  
          await client.sendMessage(m.chat, {
              document: { url: response.url },
              mimetype: "audio/mp3",
              fileName: `${song.title}.mp3`
          }, { quoted: m });
  
      } catch (error) {
          console.error("Error in play command:", error.message);
          return m.reply("Download failed: " + error.message);
      }
});





dreaded({
  pattern: "shazam",
  desc: "Shazam command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  
  
  
      const { client, m, text, qmsg, mime } = context;
  
  try {
  
  let acr = new acrcloud({
      host: 'identify-ap-southeast-1.acrcloud.com',
      access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
      access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
    });
  
  if (!/video|audio/.test(mime)) return m.reply("Tag a short video or audio for the bot to analyse.");
  
  let p = m.quoted ? m.quoted : m
  
                  let buffer = await p.download()
                 
  
  let { status, metadata } = await acr.identify(buffer)
                  if (status.code !== 0) return m.reply(status.msg); 
                  let { title, artists, album, genres, release_date } = metadata.music[0]
                  let txt = `Title: ${title}${artists ? `\nArtists: ${artists.map(v => v.name).join(', ')}` : ''}`
                  txt += `${album ? `\nAlbum: ${album.name}` : ''}${genres ? `\nGenres: ${genres.map(v => v.name).join(', ')}` : ''}\n`
                  txt += `Release Date: ${release_date}`
                   m.reply(txt.trim())
  
  } catch (error) {
  
  await m.reply("Song not recognisable..")
  
  }
});


dreaded({
  pattern: "song",
  desc: "Song command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text } = context;
      
      
  
      if (!text) {
          return m.reply("Please provide a song name!");
      }
  
      try {
          const { videos } = await yts(text);
          if (!videos || videos.length === 0) {
              throw new Error("No songs found!");
          }
  
          const song = videos[0];
  
          const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${song.url}&format=mp3`, {
              method: 'GET',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                  'Accept': 'audio/mpeg'
              }
          });
  
          if (!response.ok) {
              throw new Error(`Download failed with status ${response.status}`);
          }
  
  await m.reply(`_Downloading ${song.title}_`);
  
          await client.sendMessage(m.chat, {
              audio: { url: response.url },
              mimetype: "audio/mp3",
              fileName: `${song.title}.mp3`
          }, { quoted: m });
  
      } catch (error) {
          console.error("Error in play command:", error.message);
          return m.reply("Download failed: " + error.message);
      }
});


dreaded({
  pattern: "spotify",
  desc: "Spotify command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
          if (!text) return m.reply("What song do you want to download?");
  
  
  try {
  
  
          let data = await fetchJson(`https://api.dreaded.site/api/spotifydl?title=${text}`);
  
  if (data.success) {
  
  await m.reply("Sending song in audio and document formats...");
  
  const audio = data.result.downloadLink;
  
  const filename = data.result.title
  
          await client.sendMessage(
              m.chat,
              {
                  document: { url: audio },
                  mimetype: "audio/mpeg",
                  fileName: `${filename}.mp3`,
              },
              { quoted: m }
          );
  
  await client.sendMessage(
              m.chat,
              {
                  audio: { url: audio },
                  mimetype: "audio/mpeg",
                  fileName: `${filename}.mp3`,
              },
              { quoted: m }
          );
  
  
  } else {
  
  await m.reply("Failed to get a valid response from API endpoint");
  
  }
  
  } catch (error) {
  
  m.reply("Unable to fetch download link, try matching exact song name or with artist name.")
  
  }
});


dreaded({
  pattern: "tikaudio",
  desc: "Tikaudio command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, m, text, fetchJson } = context;
  
      const fetchTikTokData = async (url, retries = 3) => {
          for (let attempt = 0; attempt < retries; attempt++) {
              const data = await fetchJson(url);
              if (
                  data &&
                  data.status === 200 &&
                  data.tiktok &&
                  data.tiktok.music
              ) {
                  return data;
              }
          }
          throw new Error("Failed to fetch valid TikTok data after multiple attempts.");
      };
  
      try {
          if (!text) return m.reply("Provide a TikTok link for the audio.");
          if (!text.includes("tiktok.com")) return m.reply("That is not a valid TikTok link.");
  
          const url = `https://api.dreaded.site/api/tiktok?url=${text}`;
          const data = await fetchTikTokData(url);
  
          const tikAudioUrl = data.tiktok.music;
  
          m.reply(`TikTok audio data fetched successfully! Sending. . .`);
  
          const response = await fetch(tikAudioUrl);
  
          if (!response.ok) {
              throw new Error(`Failed to download audio: HTTP ${response.status}`);
          }
  
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = Buffer.from(arrayBuffer);
  
          await client.sendMessage(m.chat, {
              audio: audioBuffer,
              mimetype: "audio/mpeg",
              ptt: false,
          }, { quoted: m });
  
      } catch (error) {
          m.reply(`Error: ${error.message}`);
      }
});





dreaded({
  pattern: "twtdl",
  desc: "Twtdl command",
alias: ["twitter"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, botname, fetchJson } = context;
  
  if (!text) return m.reply("Provide a twitter or X link for the video");
  
  
  
  try {
  
  const data = await fetchJson(`https://api.dreaded.site/api/alldl?url=${text}`);
  
  
  if (!data || data.status !== 200 || !data.data || !data.data.videoUrl) {
              return m.reply("We are sorry but the API endpoint didn't respond correctly. Try again later.");
          }
  
  
  
  const twtvid = data.data.videoUrl;
  
  await client.sendMessage(m.chat,{video : {url : twtvid },caption : `Downloaded by ${botname}`,gifPlayback : false },{quoted : m}) 
  
  } catch (e) {
  
  m.reply("An error occured. API might be down\n" + e)
  
  }
});


dreaded({
  pattern: "upload",
  desc: "Upload command",
alias: ["url", "tourl"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
    const { client, m } = context;
    
    
    
    
  
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
  
    if (!mime) return m.reply('❌ Reply to a media file to upload.');
  
    const mediaBuffer = await q.download();
    if (mediaBuffer.length > 100 * 1024 * 1024) return m.reply('❌ File too large (limit 100 MB).');
  
    const tempFile = path.join(__dirname, `upload_${Date.now()}`);
    fs.writeFileSync(tempFile, mediaBuffer);
  
    m.reply('⏳ Starting upload...');
  
    const providers = [
      {
        name: 'Catbox.moe',
        upload: async () => {
          const form = new FormData();
          form.append('reqtype', 'fileupload');
          form.append('fileToUpload', fs.createReadStream(tempFile));
          const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
          });
          if (!res.data.startsWith('https://')) throw new Error('Invalid Catbox response');
          return { page: res.data, direct: res.data };
        }
      },
      {
        name: 'Pixeldrain',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://pixeldrain.com/api/file/anonymous', form, {
            headers: form.getHeaders()
          });
          const id = res.data.id;
          return {
            page: `https://pixeldrain.com/u/${id}`,
            direct: `https://pixeldrain.com/api/file/${id}`
          };
        }
      },
      {
        name: 'File.io',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://file.io/', form, {
            headers: form.getHeaders()
          });
          if (!res.data.success) throw new Error('Upload failed');
          return { page: res.data.link, direct: res.data.link };
        }
      },
      {
        name: 'Transfer.sh',
        upload: async () => {
          const fileName = `upload_${Date.now()}.bin`;
          const res = await axios.put(`https://transfer.sh/${fileName}`, fs.createReadStream(tempFile), {
            headers: { 'Content-Type': 'application/octet-stream' }
          });
          return { page: res.data, direct: res.data };
        }
      },
      {
        name: 'Uguu.se',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
          });
          if (!res.data.files || res.data.files.length === 0) throw new Error('No file returned');
          return {
            page: res.data.files[0].url,
            direct: res.data.files[0].url
          };
        }
      },
      {
        name: 'Bayfiles',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://api.bayfiles.com/upload', form, {
            headers: form.getHeaders()
          });
          const fileData = res.data.data.file;
          return {
            page: fileData.url.short,
            direct: fileData.url.full
          };
        }
      }
    ];
  
    for (let i = 0; i < providers.length; i++) {
      const { name, upload } = providers[i];
      try {
        await m.reply(`📡 Trying ${name}...`);
        const result = await upload();
        fs.unlinkSync(tempFile);
        return m.reply(`✅ Uploaded to ${name}!\n\n🌐 Page: ${result.page}\n📥 Direct: ${result.direct}`);
      } catch (err) {
        const next = providers[i + 1] ? providers[i + 1].name : 'no other providers';
        await m.reply(`⚠️ ${name} failed: ${err.message}\n🔁 Trying ${next}...`);
      }
    }
  
    fs.unlinkSync(tempFile);
    m.reply('❌ All upload providers failed. Please try again later.');
});


dreaded({
  pattern: "video",
  desc: "Video command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text } = context;
      
      
  
      if (!text) {
          return m.reply("Please provide a song name!");
      }
  
      try {
          const { videos } = await yts(text);
          if (!videos || videos.length === 0) {
              throw new Error("No songs found!");
          }
  
          const song = videos[0];
  
          const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${song.url}&format=mp4`, {
              method: 'GET',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                  'Accept': 'video/mpeg'
              }
          });
  
          if (!response.ok) {
              throw new Error(`Download failed with status ${response.status}`);
          }
  
          await client.sendMessage(m.chat, {
              video: { url: response.url },
              mimetype: "video/mp3",
              fileName: `${song.title}.mp4`
          }, { quoted: m });
  
      } catch (error) {
          console.error("Error in video command:", error.message);
          return m.reply("Download failed: " + error.message);
      }
});


dreaded({
  pattern: "ytmp3",
  desc: "Ytmp3 command",
alias: ["yta"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
      
  
      try {
              let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
          if (!urls) return m.reply('provide a valid YouTube link, eh ?');
  
          try {
  
                      let data = await fetchJson(`https://api.dreaded.site/api/ytdl/audio?url=${text}`);
  
          if (!data || !data.result || !data.result.download || !data.result.download.url) {
              return m.reply("Failed to fetch audio from the API.");
          }
  
          const {
              metadata: { title, thumbnail, duration, author },
              download: { url: audioUrl, quality, filename },
          } = data.result;
  
  
  
          await m.reply(`_Downloading ${title}_`);
  
          await client.sendMessage(
              m.chat,
              {
                  document: { url: audioUrl },
                  mimetype: "audio/mpeg",
                  fileName: filename,
              },
              { quoted: m }
          );
  
                  await client.sendMessage(m.chat, {
   audio: {url: audioUrl },
  mimetype: "audio/mpeg",
   fileName: filename }, { quoted: m });
  
          } catch (primaryError) {
              console.error("Primary API failed:", primaryError.message);
  
  
              try {
                  const fallbackData = await fetchJson(`https://api.dreaded.site/api/ytdl2/audio?url=${text}`);
                  if (!fallbackData || !fallbackData.result || !fallbackData.result.downloadUrl) {
                      throw new Error("Invalid response from fallback API");
                  }
  
                  const { title: name, downloadUrl: audio } = fallbackData.result;
  
                  await m.reply(`_Downloading ${name}_`);
                  await client.sendMessage(
                      m.chat,
                      {
                          audio: { url: audio },
                          mimetype: "audio/mpeg",
                          fileName: `${name}.mp3`,
                      },
                      { quoted: m }
                  );
  
                          await client.sendMessage(m.chat, {
   document: {url: audio },
  mimetype: "audio/mpeg",
   fileName: `${name}.mp3` }, { quoted: m });
  
              } catch (fallbackError) {
                  console.error("Fallback API failed:", fallbackError.message);
                  m.reply("Download failed: Unable to retrieve audio from both APIs.");
              }
          }
      } catch (error) {
          m.reply("Download failed\n" + error.message);
      }
});


dreaded({
  pattern: "ytmp4",
  desc: "Ytmp4 command",
alias: ["ytv"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, m, text, fetchJson } = context;
      
  
      try {
      let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
          if (!urls) return m.reply('provide a valid YouTube link, eh ?');
  
          try {
  
              const primaryData = await fetchJson(`https://api.dreaded.site/api/ytdl/video?url=${text}`);
              if (!primaryData.success || !primaryData.result || !primaryData.result.download) {
                  throw new Error("Invalid response from primary API");
              }
  
              const {
                  metadata: { title: name },
                  download: { url: videoUrl, filename },
              } = primaryData.result;
  
              await m.reply(`_Downloading ${name}_. . .`);
              await client.sendMessage(
                  m.chat,
                  {
                      video: { url: videoUrl },
                      mimetype: "video/mp4",
                      caption: name,
                      fileName: filename || `${name}.mp4`,
                  },
                  { quoted: m }
              );
  
  await client.sendMessage(
                  m.chat,
                  {
                      document: { url: videoUrl },
                      mimetype: "video/mp4",
                      caption: name,
                      fileName: filename || `${name}.mp4`,
                  },
                  { quoted: m }
              );
  
  
          } catch (primaryError) {
              console.error("Primary API failed:", primaryError.message);
  
  
              try {
                  const fallbackData = await fetchJson(`https://api.dreaded.site/api/ytdl2/video?url=${text}`);
                  if (!fallbackData.success || !fallbackData.downloadUrl || !fallbackData.title) {
                      throw new Error("Invalid response from fallback API");
                  }
  
                  const { title: name, downloadUrl: videoUrl } = fallbackData;
  
                  await m.reply(`_Downloading ${name}_`);
                  await client.sendMessage(
                      m.chat,
                      {
                          video: { url: videoUrl },
                          mimetype: "video/mp4",
                          caption: name,
                          fileName: `${name}.mp4`,
                      },
                      { quoted: m }
                  );
  
  await client.sendMessage(
                      m.chat,
                      {
                          document: { url: videoUrl },
                          mimetype: "video/mp4",
                          caption: name,
                          fileName: `${name}.mp4`,
                      },
                      { quoted: m }
                  );
  
  
              } catch (fallbackError) {
                  console.error("Fallback API failed:", fallbackError.message);
                  m.reply("Download failed: Unable to retrieve video from both APIs.");
              }
          }
      } catch (error) {
          m.reply("Download failed\n" + error.message);
      }
});

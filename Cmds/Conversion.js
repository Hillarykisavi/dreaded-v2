const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { tmpdir } = require("os");
const path = require("path");

dreaded({
  pattern: "toaudio",
  desc: "Convert quoted video to audio",
  category: "Conversion",
  filename: __filename
}, async (context) => {
  const { client, m } = context;

  if (!m.quoted || m.quoted.mtype !== "videoMessage") {
    return await client.sendMessage(m.chat, { text: "❌ Please reply to a video with this command." }, { quoted: m });
  }

  const videoBuffer = await m.quoted.download();
  const inputPath = path.join(tmpdir(), `input_${Date.now()}.mp4`);
  const outputPath = path.join(tmpdir(), `output_${Date.now()}.mp3`);

  fs.writeFileSync(inputPath, videoBuffer);

  ffmpeg(inputPath)
    .toFormat("mp3")
    .on("end", async () => {
      const audioBuffer = fs.readFileSync(outputPath);
      await client.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mp4", ptt: true }, { quoted: m });
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    })
    .on("error", async (err) => {
      console.error("FFmpeg error:", err);
      await client.sendMessage(m.chat, { text: "❌ Failed to convert video to audio." }, { quoted: m });
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    })
    .save(outputPath);
});

dreaded({
  pattern: "trim",
  desc: "Trim quoted video/audio",
  category: "Conversion",
  filename: __filename
}, async ({ client, m, match }) => {
  const args = match.split(" ");
  const start = parseInt(args[0]);
  const end = parseInt(args[1]);

  if (!m.quoted || !["videoMessage", "audioMessage"].includes(m.quoted.mtype))
    return m.reply("❌ Reply to a video or audio to trim.");

  if (isNaN(start) || isNaN(end) || end <= start)
    return m.reply("❌ Usage: trim <start> <end>. Example: !trim 5 10");

  const mediaBuffer = await m.quoted.download();
  const input = path.join(tmpdir(), `input_${Date.now()}.dat`);
  const output = path.join(tmpdir(), `output_${Date.now()}.dat`);
  fs.writeFileSync(input, mediaBuffer);

  ffmpeg(input)
    .setStartTime(start)
    .setDuration(end - start)
    .output(output)
    .on("end", async () => {
      const outBuffer = fs.readFileSync(output);
      const isVideo = m.quoted.mtype === "videoMessage";
      await client.sendMessage(m.chat, {
        [isVideo ? "video" : "audio"]: outBuffer,
        mimetype: isVideo ? "video/mp4" : "audio/mp4",
        ptt: !isVideo
      }, { quoted: m });
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    })
    .on("error", err => {
      console.error(err);
      m.reply("❌ Failed to trim media.");
    })
    .run();
});



const mergeQueue = {};

dreaded({
  pattern: "merge",
  desc: "Send image + audio separately using same command to merge them",
  category: "Conversion",
  filename: __filename
}, async ({ client, m }) => {
  const user = m.sender;
  const quoted = m.quoted;

  if (!quoted || !["imageMessage", "audioMessage"].includes(quoted.mtype)) {
    return m.reply("❌ Reply to an *image* or *audio* with !merge.\nFirst send image → !merge\nThen send audio → !merge");
  }

  const buffer = await quoted.download();
  const type = quoted.mtype === "imageMessage" ? "image" : "audio";
  const ext = type === "image" ? "jpg" : "mp3";
  const filePath = path.join(tmpdir(), `${type}_${user.replace(/[^0-9]/g, "")}.${ext}`);

  fs.writeFileSync(filePath, buffer);

  
  mergeQueue[user] = mergeQueue[user] || {};
  mergeQueue[user][type] = filePath;

  
  if (type === "image" && !mergeQueue[user].audio) {
    return m.reply("✅ Image received. Now reply with an audio and send !merge again.");
  }

  if (type === "audio" && !mergeQueue[user].image) {
    return m.reply("✅ Audio received. Now reply with an image and send !merge again.");
  }

  
  if (mergeQueue[user].image && mergeQueue[user].audio) {
    const outPath = path.join(tmpdir(), `merged_${Date.now()}.mp4`);
    m.reply("🔄 Merging image and audio...");

    ffmpeg()
      .input(mergeQueue[user].image)
      .loop()
      .input(mergeQueue[user].audio)
      .outputOptions(["-shortest", "-c:v libx264", "-c:a aac"])
      .save(outPath)
      .on("end", async () => {
        const vid = fs.readFileSync(outPath);
        await client.sendMessage(m.chat, { video: vid, mimetype: "video/mp4" }, { quoted: m });

        
        fs.unlinkSync(mergeQueue[user].image);
        fs.unlinkSync(mergeQueue[user].audio);
        fs.unlinkSync(outPath);
        delete mergeQueue[user];

        await m.reply("✅ Merge complete. Video sent.");
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        m.reply("❌ Failed to merge.");
        delete mergeQueue[user];
      });
  }
});
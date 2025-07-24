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
      await client.sendMessage(m.chat, { audio: audioBuffer, mimetype: "audio/mp4" }, { quoted: m });
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
}, async ({ client, m, text }) => {
  const args = text.split(" ");
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





dreaded({
  pattern: "tovn",
  desc: "Convert quoted video or audio to voice note",
  category: "Conversion",
  filename: __filename
}, async ({ client, m }) => {
  if (!m.quoted || !["videoMessage", "audioMessage"].includes(m.quoted.mtype)) {
    return m.reply("Reply to a video or audio.");
  }

  const media = await m.quoted.download();
  const input = path.join(tmpdir(), `in_${Date.now()}.dat`);
  const output = path.join(tmpdir(), `out_${Date.now()}.mp3`);

  fs.writeFileSync(input, media);

  ffmpeg(input)
    .audioCodec("libmp3lame")
    .save(output)
    .on("end", async () => {
      const voice = fs.readFileSync(output);
      await client.sendMessage(m.chat, {
        audio: voice,
        mimetype: "audio/mp4",
        ptt: true
      }, { quoted: m });

      fs.unlinkSync(input);
      fs.unlinkSync(output);
    })
    .on("error", err => {
      console.error(err);
      m.reply("❌ Failed to convert.");
    });
});


dreaded({
  pattern: "toimg",
  desc: "Convert static sticker to image",
  category: "Convert",
  filename: __filename
}, async ({ client, m }) => {
  try {
    const quoted = m.quoted;
    if (!quoted || quoted.mtype !== "stickerMessage") {
      return client.sendMessage(m.chat, { text: "❌ Reply to a *sticker* to convert it to image." }, { quoted: m });
    }

    if (quoted.isAnimated || quoted.isLottie || quoted.mimetype !== 'image/webp') {
      return client.sendMessage(m.chat, { text: "❌ Only *static* stickers are supported." }, { quoted: m });
    }

    const stream = await quoted.download();
    const tmpPath = "./temp/sticker.webp";
    const outPath = "./temp/image.jpg";

    await fs.promises.writeFile(tmpPath, stream);

    await exec(`ffmpeg -i ${tmpPath} ${outPath}`);

    await client.sendMessage(m.chat, {
      image: fs.readFileSync(outPath),
      caption: "Converted sticker to image."
    }, { quoted: m });

    fs.unlinkSync(tmpPath);
    fs.unlinkSync(outPath);

  } catch (err) {
    await client.sendMessage(m.chat, { text: "❌ Failed to convert sticker to image." }, { quoted: m });
  }
});
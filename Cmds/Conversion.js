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
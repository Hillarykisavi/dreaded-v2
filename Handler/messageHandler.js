const { smsg } = require('../Handler/smsg');
const handleDreaded = require("../Client/dreaded");
const antidelete = require('../Functions/antidelete');
const {
  getGroupSetting,
  getSettings,
  getBannedUsers,
  banUser
} = require("../Database/adapter");

module.exports = (client, store, groupCache) => async (chatUpdate) => {
  const mek = chatUpdate.messages?.[0];
  if (!mek?.message) return;

  const settings = await getSettings();
  if (!settings) return;

  const { autoread, autolike, autoview, presence } = settings;

  try {
    // unwrap ephemeral messages before smsg()
    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage"
      ? mek.message.ephemeralMessage.message
      : mek.message;

    const m = smsg(client, mek, store);
    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || "";
    const isGroup = mek.key.remoteJid.endsWith("@g.us");
    const sender = mek.key.participant || mek.key.remoteJid;
    const botNumber = await client.decodeJid(client.user.id);

   
    if (isGroup) {
      const groupSettings = await getGroupSetting(mek.key.remoteJid);
      const antilink = groupSettings?.antilink;
      const linkRegex = /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|bit\.ly\/|discord\.gg\/)[^\s]+/i;
      const containsLink = linkRegex.test(messageContent);

      if (['true', true].includes(antilink) && containsLink) {
        const context = await client.getGroupContext(m, botNumber);
        const { isAdmin, isBotAdmin, groupSender } = context;

        if (!isBotAdmin) return;
        if (!isAdmin) {
          await client.sendMessage(mek.key.remoteJid, {
            text: `🚫 @${groupSender.split("@")[0]}, sending links is prohibited! You have been removed.`,
            contextInfo: { mentionedJid: [sender] }
          }, { quoted: mek });

          await client.groupParticipantsUpdate(mek.key.remoteJid, [groupSender], "remove");

          await client.sendMessage(mek.key.remoteJid, {
            delete: {
              remoteJid: mek.key.remoteJid,
              fromMe: false,
              id: mek.key.id,
              participant: groupSender
            }
          });
        }
      }
    }

    
    if (mek.message?.protocolMessage?.key) {
      await antidelete.handleMessageRevocation(client, mek, botNumber);
    } else {
      antidelete.handleIncomingMessage(mek);
    }

   
    if (mek.key.remoteJid === "status@broadcast") {
      if (autolike) {
        const emojis = ['💗', '🧠', '🧸', '📍'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await client.sendMessage(mek.key.remoteJid, {
          react: { text: randomEmoji, key: mek.key }
        });
      }

      if (autoview) {
        await client.readMessages([mek.key]);
      }
    } else if (autoread && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
      await client.readMessages([mek.key]);
    }

    
    if (presence && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
      await client.sendPresenceUpdate(presence, mek.key.remoteJid);
    }

    
    if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

    handleDreaded(client, m, chatUpdate, store);
  } catch (err) {
    console.error("❌ Error in message handler:", err);
  }
};
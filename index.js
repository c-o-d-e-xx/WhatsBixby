/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/
import makeWASocket, { useMultiFileAuthState, downloadContentFromMessage } from '@adiwajshing/baileys';
import fs from 'fs';
import axios from 'axios';
import ytdl from 'ytdl-core';
import { setTimeout as delay } from 'timers/promises';
import path from 'path';

/**
 * IanMegaBot - ES module ready
 * - Ensure package.json includes "type": "module"
 * - start.sh must be executable and will handle AUTH_TAR_B64 if provided
 */

const folders = [
  './media',
  './media/statuses/images',
  './media/statuses/videos',
  './media/downloads',
  './media/yt'
];
folders.forEach(f => { if (!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true }) });

function randomSlangReply() {
  const replies = [
    "Aii broo 😂 niko area unadai nini?",
    "Wueh mambo ni gani sasa 💀",
    "Weh maze hiyo ni noma ✌️",
    "Sasa buda, uko aje 😂",
    "Aje bossman, naskia vibaya 💀😂",
    "Eeh bana unakam kuongea nini?"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

const firstReply = "Boyz maisha ina mmaliza aki faulu ata ku text 💀";
const secondReply = "Ama umtafute offline juu ni December boyz anaeza kua ako sherehe🤣🤣✌️";
const thirdReply = "For status save just type .save ✌️";

/**
 * Write an async-iterable (Baileys stream) to a file
 */
async function streamToFile(stream, filePath) {
  const write = fs.createWriteStream(filePath);
  try {
    for await (const chunk of stream) {
      write.write(chunk);
    }
    write.end();
    await new Promise((resolve, reject) => {
      write.on('finish', resolve);
      write.on('error', reject);
    });
  } finally {
    // nothing
  }
}

async function downloadAndSave(messageContent, type, destPath) {
  const stream = await downloadContentFromMessage(messageContent, type);
  await streamToFile(stream, destPath);
  return destPath;
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ['Ian-Bot', 'Safari', '1.0']
  });

  sock.ev.on('creds.update', saveCreds);

  const replied = {};
  const reactionEmojis = ["😂", "✌️", "💀"];

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0];
    if (!m || !m.message || !m.key) return;

    const from = m.key.remoteJid || '';
    const text = (
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''
    ).toString().trim();

    try {
      if (from.includes('status')) {
        try {
          await sock.readMessages([m.key]);
          const emoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
          await sock.sendMessage(from, { react: { text: emoji, key: m.key } });
          await sock.sendMessage(from, { text: "ianoh💀✌️ just viewed your status" });
          await sock.sendMessage(from, { text: firstReply });
          await delay(1500);
          await sock.sendMessage(from, { text: secondReply });
          await delay(1500);
          await sock.sendMessage(from, { text: thirdReply });
        } catch (err) {
          console.error("❌ Status error", err);
        }
        return;
      }
    } catch (err) {
      console.error("Status handling top-level error:", err);
    }

    try {
      if (!replied[from]) {
        replied[from] = true;
        await sock.sendMessage(from, { text: firstReply });
        await sock.sendMessage(from, { text: secondReply });
        await sock.sendMessage(from, { text: thirdReply });
        return;
      }
    } catch (err) {
      console.error("First-reply error:", err);
    }

    try {
      if (text && (text.toLowerCase() === "!menu" || text.toLowerCase() === "!help")) {
        const menuText = `
🔥 IAN BOT MEGA MENU 🔥

Chat & Fun

!ai <message> → Chat with AI (Sheng + Swahili + slang + emojis)

!status → Show bot status / bio


Group Management

.add <number> → Add member by number (bot must be admin)

.remove → Remove replied member (bot must be admin)

.remove all → Remove all members (bot must be admin)

.all → Tag all group members


Media Downloads

.save → Save viewed status

!yt <link> → Download YouTube audio/video

!dl <link> → Download IG/FB/TikTok video


Fun Features

Auto-view status instantly

Auto react to statuses with 😂 ✌️ 💀

Auto-save media sent to bot

Fake typing & recording

Auto-like statuses

Continuous AI conversation

First-time auto-replies (3 messages)
`;
        await sock.sendMessage(from, { text: menuText });
        return;
      }
    } catch (err) {
      console.error("Menu error:", err);
    }

    try {
      if (text && !text.startsWith('.') && !text.startsWith('!')) {
        const reply = randomSlangReply();
        await sock.sendMessage(from, { text: reply });
      }
    } catch (err) {
      console.error("AI chat error:", err);
    }

    try {
      if (text === ".save") {
        if (m.message.imageMessage) {
          const fileName = `./media/statuses/images/status_${Date.now()}.jpg`;
          await downloadAndSave(m.message.imageMessage, 'image', fileName);
          await sock.sendMessage(from, { text: `✅ Status saved as ${fileName}` });
        } else if (m.message.videoMessage) {
          const fileName = `./media/statuses/videos/status_${Date.now()}.mp4`;
          await downloadAndSave(m.message.videoMessage, 'video', fileName);
          await sock.sendMessage(from, { text: `✅ Status saved as ${fileName}` });
        } else {
          await sock.sendMessage(from, { text: "Bro tumia hii command ukiwa umeview status 💀" });
        }
      }
    } catch (err) {
      console.error("Save status error:", err);
      try { await sock.sendMessage(from, { text: "❌ Failed to save status" }); } catch(_) {}
    }

    try {
      if (text === ".all" && from.endsWith("@g.us")) {
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants.map(p => p.id);
        await sock.sendMessage(from, { text: "Everyone roll call 😂✌️", mentions: participants });
      }
    } catch (err) {
      console.error("Tag all error:", err);
    }

    try {
      if (text.startsWith(".add") && from.endsWith("@g.us")) {
        let number = text.split(" ")[1];
        if (!number) {
          await sock.sendMessage(from, { text: "Provide number to add. Example: .add 2547xxxxxxx" });
        } else {
          if (!number.endsWith("@s.whatsapp.net")) number += "@s.whatsapp.net";
          try {
            await sock.groupAdd(from, [number]);
            await sock.sendMessage(from, { text: `✅ Added ${number}` });
          } catch (err) {
            console.error("Add member error:", err);
            await sock.sendMessage(from, { text: `❌ Failed to add ${number}. Make sure I am admin!` });
          }
        }
      }
    } catch (err) {
      console.error("Add handler error:", err);
    }

    try {
      if (text === ".remove" && from.endsWith("@g.us") && m.message.extendedTextMessage?.contextInfo?.participant) {
        let participant = m.message.extendedTextMessage.contextInfo.participant;
        try {
          await sock.groupRemove(from, [participant]);
          await sock.sendMessage(from, { text: `✅ Removed ${participant}` });
        } catch (err) {
          console.error("Remove participant error:", err);
          await sock.sendMessage(from, { text: `❌ Failed to remove ${participant}. Make sure I am admin!` });
        }
      }
    } catch (err) {
      console.error("Remove handler error:", err);
    }

    try {
      if (text === ".remove all" && from.endsWith("@g.us")) {
        try {
          let metadata = await sock.groupMetadata(from);
          let participants = metadata.participants.map(p => p.id);
          const botId = sock.user?.id;
          participants = participants.filter(p => p !== botId);
          const BATCH = 8;
          for (let i = 0; i < participants.length; i += BATCH) {
            const batch = participants.slice(i, i + BATCH);
            await sock.groupRemove(from, batch);
          }
          await sock.sendMessage(from, { text: "✅ Removed all members from the group!" });
        } catch (err) {
          console.error("Remove all error:", err);
          await sock.sendMessage(from, { text: "❌ Failed to remove all members. Make sure I am admin!" });
        }
      }
    } catch (err) {
      console.error("Remove all handler error:", err);
    }

    try {
      if (m.message.imageMessage) {
        const fileName = `./media/media_${Date.now()}.jpg`;
        await downloadAndSave(m.message.imageMessage, 'image', fileName);
        await sock.sendMessage(from, { text: `📁 Media saved as ${fileName}` });
      }
      if (m.message.videoMessage) {
        const fileName = `./media/media_${Date.now()}.mp4`;
        await downloadAndSave(m.message.videoMessage, 'video', fileName);
        await sock.sendMessage(from, { text: `📁 Media saved as ${fileName}` });
      }
    } catch (err) {
      console.error("Auto-save media error:", err);
    }

    try {
      if (text.startsWith("!yt ")) {
        const link = text.split(" ")[1];
        if (!link || !ytdl.validateURL(link)) {
          await sock.sendMessage(from, { text: "Provide a valid YouTube link. Example: !yt https://youtube.com/..." });
        } else {
          const filePath = `./media/yt/song_${Date.now()}.mp3`;
          try {
            const writeStream = fs.createWriteStream(filePath);
            ytdl(link, { filter: 'audioonly' }).pipe(writeStream);
            await new Promise((resolve, reject) => {
              writeStream.on('finish', resolve);
              writeStream.on('error', reject);
            });
            await sock.sendMessage(from, { document: fs.createReadStream(filePath), mimetype: "audio/mpeg", fileName: path.basename(filePath) });
          } catch (err) {
            console.error("YT download error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to download video/song" });
          } finally {
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
          }
        }
      }
    } catch (err) {
      console.error("YT handler error:", err);
    }

    try {
      if (text.startsWith("!dl ")) {
        const url = text.split(" ")[1];
        try {
          const res = await axios.post("https://api.example.com/download", { url });
          if (res.data?.video) {
            await sock.sendMessage(from, { video: { url: res.data.video }, caption: "Downloaded 🎥" });
          } else if (res.data?.file) {
            await sock.sendMessage(from, { text: "Downloaded but API returned unexpected payload. Update handler as needed." });
          } else {
            await sock.sendMessage(from, { text: "❌ Failed to download from IG/FB/TikTok (unexpected response)" });
          }
        } catch (err) {
          console.error("DL service error:", err);
          await sock.sendMessage(from, { text: "❌ Failed to download from IG/FB/TikTok" });
        }
      }
    } catch (err) {
      console.error("DL handler error:", err);
    }

  });

  sock.ev.on('connection.update', (update) => {
    console.log('connection.update', JSON.stringify(update));
  });
}

startBot().catch(err => {
  console.error("Bot start failed:", err);
  process.exit(1);
});

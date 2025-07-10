const {
  Bixby,
  MODE,
  config
} = require("../lib");
const fs = require("fs");
const path = require("path");
const { BASE_URL, API_KEY, STICKER_DATA } = require("../config");
const axios = require("axios");

Bixby(
  {
    pattern: "sticker",
    fromMe: MODE,
    desc: 'make stickers',
    react: "🔁",
    type : 'converter',
  },
  async (message, match) => {
    if (!/image|video|webp/.test(message.mime)) return await message.send(
      '> please reply to a sticker message'
        );
     if (message.reply_message.mime) {
        let download = await message.reply_message.download();
        return await message.sendSticker(message.jid, download, {
          author: STICKER_DATA.split(/[|;,]/)[0] || STICKER_DATA,
          packname: STICKER_DATA.split(/[|;,]/)[1],
        });
      } else if (/image|video|webp/.test(message.mime)) {
        let download = await message.client.downloadMediaMessage(message);
        return await message.sendSticker(message.jid, download, {
          author: STICKER_DATA.split(/[|;,]/)[0] || STICKER_DATA,
          packname: STICKER_DATA.split(/[|;,]/)[1],
        });
      } else {
        return await message.send(
          '```invalid meda as you replied```'
        );
      }
  }
);


Bixby({
  pattern: 'attp ?(.*)',
  fromMe: MODE,
  desc: 'Send sticker from text using TTP API',
  type: 'fun',
  react: '🖼️'
}, async (message, match) => {
  const text = match || message.reply_message?.text;
  if (!text) return await message.send("> Please provide text or reply to a message with text.");

  try {
    const url = `${BASE_URL}maker/attp?text=${encodeURIComponent(text)}&apikey=${API_KEY}`;

    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    await message.sendSticker(message.jid, Buffer.from(response.data), {
      author: STICKER_DATA.split(/[|;,]/)[0] || STICKER_DATA,
      packname: STICKER_DATA.split(/[|;,]/)[1] || ''
    });
  } catch (err) {
    console.error(err);
    await message.send('❌ Failed to generate sticker.');
  }
});

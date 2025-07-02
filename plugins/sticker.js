const {
  Bixby,
  MODE,
  config
} = require("../lib");
const fs = require("fs");
const path = require("path");

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
          author: config.STICKER_DATA.split(/[|;,]/)[0] || config.STICKER_DATA,
          packname: config.STICKER_DATA.split(/[|;,]/)[1],
        });
      } else if (/image|video|webp/.test(message.mime)) {
        let download = await message.client.downloadMediaMessage(message);
        return await message.sendSticker(message.jid, download, {
          author: config.STICKER_DATA.split(/[|;,]/)[0] || config.STICKER_DATA,
          packname: config.STICKER_DATA.split(/[|;,]/)[1],
        });
      } else {
        return await message.send(
          '```invalid meda as you replied```'
        );
      }
  }
);

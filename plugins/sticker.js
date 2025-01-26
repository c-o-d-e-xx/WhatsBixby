/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, fromMe, isPrivate, toAudio, getBuffer } = require("../lib/");
const { webp2mp4, textToImg } = require("../lib/functions");
const {PACKNAME, AUTHOR, BASE_URL, API_KEY } = require("../config");
const axios = require("axios");

Bixby(
  {
    pattern: "tgs",
    fromMe: isPrivate,
    desc: "Download Sticker From Telegram",
    type: "tool",
  },
  async (message, match) => {
    if (!match)
      return message.reply(
        "_Enter a tg sticker url_\nEg: https://t.me/addstickers/Oldboyfinal\nKeep in mind that there is a chance of ban if used frequently"
      );
    let packid = match.split("/addstickers/")[1];
    let { result } = await getJson(
      `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=${encodeURIComponent(
        packid
      )}`
    );
    if (result.is_animated)
      return message.reply(" *Animated Stickers Are Not Supported*  ");
    message.reply(
      `*ᴛᴏᴛᴀʟ sᴛɪᴄᴋᴇʀs :* ${result.stickers.length}\n*ᴇsɪᴛɪᴍᴀᴛᴇᴅ ᴄᴏᴍᴘʟᴇᴛᴇ ɪɴ:* ${
        result.stickers.length * 1.5
      } seconds`.trim()
    );
    for (let sticker of result.stickers) {
      let file_path = await getJson(
        `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${sticker.file_id}`
      );
      await message.sendMessage(
        `https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${file_path.result.file_path}`,
        { packname: PACKNAME, author: AUTHOR },
        "sticker"
      );
      sleep(1500);
    }
  }
);

Bixby(
  {
    pattern: "attp",
    fromMe: isPrivate,
    desc: "text to rgb sticker",
    type: "sticker",
  },
  async (message, match) => {
    
      match = match || message.reply_message.text;
      if (!match) {
        return await message.reply("please enter any text");
      } 
        const apiurl = `${BASE_URL}maker/attp?text=${encodeURIComponent(match)}&apikey=${API_KEY}`;
        const response = await axios.get(apiurl, { responseType: 'arraybuffer' });

        if (response.status === 200) {
          const stickerBuffer = Buffer.from(response.data, 'binary');
          await message.sendMessage(
            stickerBuffer,
            {
              packname: PACKNAME,
              author: AUTHOR,
            },
            'sticker'
          );
        }          
  }
);
      
Bixby(
  {
    pattern: "ttp",
    fromMe: isPrivate,
    desc: "text to picture",
    type: "converter",
  },
  async (message, match) => {
match = match || message.reply_message.text;
if (!match) return await message.reply("please enter any text");
var url = `${BASE_URL}maker/ttp?text=${match}&apikey=${API_KEY}`
var image = await getBuffer(url);
const buttonMessage = {
    image: image,
}
message.client.sendMessage(message.jid, buttonMessage, { quoted: message })
})

Bixby(
  {
    pattern: "sticker",
    fromMe: isPrivate,
    desc: "Converts Photo/video/text to sticker",
    type: "converter",
  },
  async (message, match, m) => {
    if (
      !(
        message.reply_message.video ||
        message.reply_message.image ||
        message.reply_message.text
      )
    )
      return await message.reply("_Reply to photo/video/text_");
    if (message.reply_message.text) {
      let buff = await textToImg(message.reply_message.text);
      return await message.sendMessage(
        message.jid,
        buff,
        { mimetype: "image/webp" },
        "stickerMessage"
      );
    }
    let buff = await m.quoted.download();
    message.sendMessage(
      message.jid,
      buff,
      { packname: PACKNAME, author: AUTHOR },
      "sticker"
    );
  }
);

Bixby(
  {
    pattern: "take",
    fromMe: isPrivate,
    desc: "Converts Photo or video to sticker",
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message.sticker)
      return await message.reply("_Reply to a sticker_");
    let isme = await fromMe(message.participant)
    let packname, author;
    if(!isme){
       packname = match.split(":")[0] || "𝞓𝙇𝞘𝞢𝞜-𝞓𝙇𝙁𝞓";
       author = match.split(":")[1] || message.pushName;
    } else {
       packname = match.split(":")[0] || PACKNAME;
       author = match.split(":")[1] || AUTHOR;
    }
    let buff = await m.quoted.download();
    message.sendMessage(message.jid, buff, { packname, author }, "sticker");
  }
);

Bixby(
  {
    pattern: "photo",
    fromMe: isPrivate,
    desc: "Changes sticker to Photo",
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message.sticker)
      return await message.reply("_Not a sticker_");
    let buff = await m.quoted.download();
    return await message.sendMessage(message.jid, buff, {}, "image");
  }
);

Bixby(
  {
    pattern: "mp3",
    fromMe: isPrivate,
    desc: "converts video/voice to mp3",
    type: "downloader",
  },
  async (message, match, m) => {
    let buff = await m.quoted.download();
    console.log(typeof buff);
    buff = await toAudio(buff, "mp3");
    console.log(typeof buff);
    return await message.sendMessage(
      message.jid,
      buff,
      { mimetype: "audio/mpeg" },
      "audio"
    );
  }
);

Bixby(
  {
    pattern: "mp4",
    fromMe: isPrivate,
    desc: "converts video/voice to mp4",
    type: "downloader",
  },
  async (message, match, m) => {
    if (
      !message.reply_message.video ||
      !message.reply_message.sticker ||
      !message.reply_message.audio
    )
      return await message.reply("_Reply to a sticker/audio/video_");
    let buff = await m.quoted.download();
    if (message.reply_message.sticker) {
      buff = await webp2mp4(buff);
    } else {
      buff = await toAudio(buff, "mp4");
    }
    return await message.sendMessage(
      message.jid,
      buff,
      { mimetype: "video/mp4" },
      "video"
    );
  }
);


Bixby(
  {
    pattern: "img",
    fromMe: isPrivate,
    desc: "Converts Sticker to image",
    type: "converter",
  },
  async (message, match, m) => {
    if (!message.reply_message.sticker)
      return await message.reply("_Reply to a sticker_");
    let buff = await m.quoted.download();
    return await message.sendMessage(message.jid, buff, {}, "image");
  }
);

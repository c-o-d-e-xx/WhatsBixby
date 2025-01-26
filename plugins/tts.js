/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib")
const config = require('../config')
const googleTTS = require('google-tts-api');

Bixby({
  pattern: "tts",
  fromMe: isPrivate,
  desc: "google-tts",
  type: "tool"
}, async (message, match) => {
  try {
    if (!match) return await message.reply("Waiting for a query");

    const getLanguageFromText = (input) => {
      const qmatch = input.match(/^\{(\w{2})\}\s*/);
      if (qmatch) {
        const cleanedInput = input.replace(qmatch[0], "").trim();
        return { lang: qmatch[1], text: cleanedInput };
      } else {
        return { lang: 'en', text: input };
      }
    };

    const sendAudioMessage = async (text, lang) => {
      const url = await googleTTS.getAudioUrl(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com'
      });
      await message.client.sendMessage(message.jid, {
        audio: { url: url },
        mimetype: "audio/mpeg",
        ptt: true,
        waveform: ["00", "99", "00", "99", "00", "99", "00"]
      });
    };

    const sendLongTextMessage = async (text, lang) => {
      await message.reply("_This is a very *long text*. I will *break it down* to smaller parts_");
      const urls = await googleTTS.getAllAudioUrls(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com'
      });
      let part = 1;
      for (const tex of urls) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await message.client.sendMessage(message.jid, {
          text: `*Part ${part++}*\n\n${tex.shortText}`
        });
        await message.client.sendMessage(message.jid, {
          audio: { url: tex.url },
          mimetype: "audio/mpeg",
          ptt: true,
          waveform: ["00", "99", "00", "99", "00", "99", "00"]
        });
      }
      await message.client.sendMessage(message.jid, { text: "_Finished!_" });
    };

    const { lang, text } = getLanguageFromText(match);

    if (text.length < 200) {
      await sendAudioMessage(text, lang);
    } else {
      await sendLongTextMessage(text, lang);
    }

  } catch (error) {
    console.error("[Error]:", error);
  }
});

    

  //============================================================================================================================================
  
  
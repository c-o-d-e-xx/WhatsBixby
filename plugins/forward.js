/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, parsedJid } = require("../lib/");

Bixby(
  {
    pattern: "fwd",
    fromMe: true,
    desc: "Forwards the replied Message",
    type: "Util",
  },
  async (message, match, m) => {
    if (!m.quoted) return message.reply('Reply to something');
    
    let jids;
    if (match.includes("@g.us")) {
      jids = match.split(' ').filter(word => word.includes("@g.us"));
    } else {
      jids = parsedJid(match);
    }

    if (match.includes("ptt")) {
      if (message.reply_message.audio) {
        for (let i of jids) {
          try {
            const relayOptions = { ptt: true, messageId: m.quoted.key.id };
            await message.client.relayMessage(i, m.quoted.message, relayOptions);
          } catch (error) {
            console.error("[Error]:", error);
          }
        }
      } else {
        return message.reply('This is not an audio');
      }
    } else {
      for (let i of jids) {
        try {
          const relayOptions = { messageId: m.quoted.key.id };
          await message.client.relayMessage(i, m.quoted.message, relayOptions);
        } catch (error) {
          console.error("[Error]:", error);
        }
      }
    }
  }
);

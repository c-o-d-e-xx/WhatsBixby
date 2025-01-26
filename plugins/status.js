/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib")
const config = require("../config")

Bixby(
  {
    on: "text",
    fromMe: false,
    desc: "Save or Give Status Updates",
    dontAddCommandList: true,
    type: "Tool",
  },
  async (message, match, m) => {
    try {
      if (message.isGroup) return;
      const triggerKeywords = ["save", "send", "sent", "snt", "give", "snd"];
      const cmdz = match.toLowerCase().split(" ")[0];
      if (triggerKeywords.some((tr) => cmdz.includes(tr))) {
        const relayOptions = { messageId: m.quoted.key.id };
        return await message.client.relayMessage(
          message.jid,
          m.quoted.message,
          relayOptions
        );
      }
    } catch (error) {
      console.error("[Error]:", error);
    }
  }
);  
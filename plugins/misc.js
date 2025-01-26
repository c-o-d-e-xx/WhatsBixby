/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib");
Bixby(
  {
    pattern: "request",
    fromMe: isPrivate,
    desc: "request something to dev",
    type: "misc",
  },
  async (message, match) => {
    if (!match) {
        await message.reply("Please provide your request message. Example: request Please add a new feature.");
        return;
    }
    const developerNumber = '919446072492';
    const requestMessage = `*Request from ${message.jid}*\n\n${match}`;
    await message.client.sendMessage(developerNumber + "@s.whatsapp.net", { text: requestMessage }, { quoted: message });
    await message.reply("Your request has been sent to the bot developer. Thank you!");
});

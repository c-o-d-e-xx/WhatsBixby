/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib/");
const { listall } = require("../lib/functions");

Bixby(
  {
    pattern: "fancy",
    fromMe: isPrivate,
    desc: "converts text to fancy text",
    type: "converter",
  },
  async (message, match) => {
    let text = match;
    let replyMessageText = message.reply_message && message.reply_message.text;

    if (replyMessageText) {
      if (!isNaN(match))
        return await message.reply(styleText(replyMessageText, match));
      
      let fancyTexts = listAllFancyTexts(replyMessageText);
      return await message.reply(fancyTexts);
    }

    if (!text) {
      let fancyTexts = listAllFancyTexts("Fancy");
      return await message.reply(fancyTexts);
    }

    if (!isNaN(match)) {
      if (match > listAllFancyTexts("Fancy").length) {
        return await message.sendMessage("Invalid number");
      }
      return await message.reply(styleText(text, match));
    }

    let fancyTexts = listAllFancyTexts(match);
    return await message.reply(fancyTexts);
  }
);

function listAllFancyTexts(text) {
  let message = "Fancy text generator\n\nReply to a message\nExample: .fancy 32\n\n";
  listall(text).forEach((txt, index) => {
    message += `${index + 1} ${txt}\n`;
  });
  return message;
}

function styleText(text, index) {
  index = index - 1;
  return listall(text)[index];
}

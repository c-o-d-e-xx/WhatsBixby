/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate, serialize } = require("../lib/");
const { loadMessage } = require("../lib/db/StoreDb");

Bixby(
  {
    pattern: "quoted",
    fromMe: isPrivate,
    desc: "quoted message",
  },
  async (message, m, match) => {
    if (!message.reply_message && !match) {
      return await message.reply("*Reply to a message or provide ID*");
    }

    let key = await String(match || (message.reply_message && message.reply_message.key.id) || '').trim();
        if (!key) {
      return await message.reply("*No valid key found*");
    }

    let msg = await loadMessage(await key.trim());
    console.log("Key: '"+key+"'\n\n"+ await msg);

    if (msg) {

      msg = serialize(
        JSON.parse(JSON.stringify(await msg.message)),
        message.client
      );
      message.forward(message.jid, msg.message);
    }

    if (!msg) {
      return await message.reply(
        "_Message not found, maybe bot might not be running at that time_"
      );
    }

    msg = serialize(
      JSON.parse(JSON.stringify(await msg.message)),
      message.client
    );

    if (!msg.quoted || !msg.quoted.message) {
      return await message.reply("No quoted message found");
    }

    await message.forward(message.jid, msg.quoted.message);
  }
);

/*
> const { command, isPrivate, serialize } = require("../../lib/");


command({
  pattern: 'wapoll ?(.*)',
  fromMe: true,
  desc: "Creates poll (WhatsApp feature)",
  use: 'group',
  usage: '.wapoll Poll title,option,option,option'
}, (async (message, match) => {
  //if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
  if (!match[1]) return await message.sendReply(`_Need params!_\n_.wapoll title,option,option_`)
  match = match[1].split(',')
  const buttons = [];
  for (let i = 1; i < match.length; i++) {
  buttons.push({optionName: match[i]})
  }
  await message.client.relayMessage(message.jid, { senderKeyDistributionMessage: {groupId: message.jid}, messageContextInfo: {messageSecret: "LzBNJaq8ZGE/2hn5bUplPvecdDxTSI1qduEbbIMI5J4="}, pollCreationMessage: { name: match[0], options: buttons, selectableOptionsCount: 0 } }, {});
}));

*/

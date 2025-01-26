/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isAdmin, isPrivate, fromMe } = require("../lib");
const { setMessage, getMessage, delMessage, getStatus, toggleStatus } =
  require("../lib/db").Greetings;

Bixby(
  {
    pattern: "welcome",
    fromMe: isPrivate,
    desc: "description",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup) return;
    let me = await fromMe(message.participant)
    let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
    if (!isadmin && !me ) return await message.reply("_You're not admin_");

    let { prefix } = message;
    let status = await getStatus(message.jid, "welcome");
    let stat = status ? "on" : "off";

    if (!match) {
      let replyMsg = `Welcome manager\n\nGroup: ${
        (await message.client.groupMetadata(message.jid)).subject
      }\nStatus: ${stat}\n\nAvailable Actions:\n\n- ${prefix}welcome get: Get the welcome message\n- ${prefix}welcome on: Enable welcome message\n- ${prefix}welcome off: Disable welcome message\n- ${prefix}welcome delete: Delete the welcome message`;

      return await message.reply(replyMsg);
    }

    if (match === " get") {
      let msg = await getMessage(message.jid, "welcome");
      if (!msg) return await message.reply("_There is no welcome set_");
      return message.reply(msg.message);
    }

    if (match === " on") {
      let msg = await getMessage(message.jid, "welcome");
      if (!msg)
        return await message.reply("_There is no welcome message to enable_");
      if (status) return await message.reply("_Welcome already enabled_");
      await toggleStatus(message.jid);
      return await message.reply("_Welcome enabled_");
    }

    if (match === " off") {
      if (!status) return await message.reply("_Welcome already disabled_");
      await toggleStatus(message.jid, "welcome");
      return await message.reply("_Welcome disabled_");
    }

    if (match == " delete") {
      await delMessage(message.jid, "welcome");
      return await message.reply("_Welcome deleted successfully_");
    }
    await setMessage(message.jid, "welcome", match);
    return await message.reply("_Welcome set successfully_");
  }
);

Bixby(
  {
    pattern: "goodbye",
    fromMe: isPrivate,
    desc: "description",
    type: "group",
  },
  async (message, match) => {
    if (!message.isGroup) return;
    let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
    if (!isadmin) return await message.reply("_You're not admin_");

    let status = await getStatus(message.jid, "goodbye");
    let stat = status ? "on" : "off";
    let replyMsg = `Goodbye manager\n\nGroup: ${
      (await message.client.groupMetadata(message.jid)).subject
    }\nStatus: ${stat}\n\nAvailable Actions:\n\n- goodbye get: Get the goodbye message\n- goodbye on: Enable goodbye message\n- goodbye off: Disable goodbye message\n- goodbye delete: Delete the goodbye message`;

    if (!match) {
      return await message.reply(replyMsg);
    }

    if (match === " get") {
      let msg = await getMessage(message.jid, "goodbye");
      if (!msg) return await message.reply("_There is no goodbye set_");
      return message.reply(msg.message);
    }

    if (match === " on") {
      await toggleStatus(message.jid, "goodbye");
      return await message.reply("_Goodbye enabled_");
    }

    if (match === " off") {
      await toggleStatus(message.jid);
      return await message.reply("_Goodbye disabled_");
    }

    if (match === " delete") {
      await delMessage(message.jid, "goodbye");
      return await message.reply("_Goodbye deleted successfully_");
    }

    await setMessage(message.jid, "goodbye", match);
    return await message.reply("_Goodbye set successfully_");
  }
);

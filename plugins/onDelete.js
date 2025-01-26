/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { DELETED_LOG_CHAT, DELETED_LOG } = require("../config");
const { Bixby, isPrivate, serialize } = require("../lib");
const { loadMessage, getName } = require("../lib/db/StoreDb");

Bixby(
  {
    on: "delete",
    fromMe: isPrivate,
    desc: "Logs the recent deleted message",
  },
  async (message, match) => {
    if (!DELETED_LOG) return;
    if (!DELETED_LOG_CHAT || "")
      return await message.sendMessage(
        message.user,
        "Please set DELETED_LOG_CHAT in ENV to use log delete message"
      );
    let msg = await loadMessage(message.messageId);
    if (!msg) return;
    msg = await serialize(
      JSON.parse(JSON.stringify(msg.message)),
      message.client
    );
    if (!msg) return await message.reply("No deleted message found");
    let deleted = await message.forward(DELETED_LOG_CHAT, msg.message);
    var name;
    if (!msg.from.endsWith("@g.us")) {
      let getname = await getName(msg.from);
      name = `_Name : ${getname}_`;
    } else {
      let gname = (await message.client.groupMetadata(msg.from)).subject;
      let getname = await getName(msg.sender);
      name = `_Group : ${gname}_\n_Name : ${getname}_`;
    }
    return await message.sendMessage(
      DELETED_LOG_CHAT,
      `_Message Deleted_\n_From : ${msg.from}_\n${name}+\n_SenderJid : ${msg.sender}_`,
      { quoted: deleted }
    );
  }
);

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
  Bixby,
  fromMe,
  sleep,
  isPrivate
} = require("../lib")
const { isAdmin, parsedJid } = require("../lib");
const { getDevice } = require("@whiskeysockets/baileys");

Bixby(
  {
    pattern: "kickall",
    fromMe: true,
    desc: "Adds a person to group",
    type: "group",
  },
  async (message, match) => {
    let { participants } = await message.client.groupMetadata(message.jid);
    let isadmin = await isAdmin(message.jid, message.user, message.client);
    if (!isadmin) return await message.reply("_I'm not admin_");

    for (let key of participants) {
      let jid = parsedJid(key.id);
      if (!(parsedJid(message.client.user.id)[0] in jid)) {
        await message.kick(jid);
        await message.reply(`@${jid[0].split("@")[0]} kicked`, {
          mentions: jid,
        });
      }
    }
  }
);



Bixby(
  {
    pattern: "user",
    fromMe: true,
    type: "tools",
  },
async (message, match) => {
  let me = await fromMe(message.participant)
  if (me) {
      try {
        let bb = await getDevice(message.reply_message.key.id)
        await message.client.sendMessage(message.jid, {text: "```Checking...```",edit: message.key});
          const end = new Date().getTime();
          setTimeout(async () => {
              return await message.client.sendMessage(message.jid, {text: `Device: ${bb === "unknown" ? "Baileys or Other" : bb === "ios" ? "iPhone iOS" : bb === "android" ? "Android Device" : bb === "web" ? "WhatsApp Web Client" : bb}`,edit: message.key});
          }, 1000)
      } catch (error) {
          console.error("[Error]:", error);
      }
  } else if (!me) {
      try {
        let bb = await getDevice(message.reply_message.key.id)
        let {key} = await message.reply("```Checking...```");
          setTimeout(async () => {
              return await message.client.sendMessage(message.jid, {text: `Device: ${bb === "unknown" ? "Baileys or Other" : bb === "ios" ? "iPhone iOS" : bb === "android" ? "Android Device" : bb === "web" ? "WhatsApp Web Client" : bb}`,edit: key});
          }, 1000)
      } catch (error) {
          console.error("[Error]:", error);
      }
  }
  })

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Greetings,
    isAdmin,
    serialize,
    downloadMedia,
    Function,
    Bixby,
    commands,
    getBuffer,
    WriteSession,
    decodeJid,
    parseJid,
    parsedJid,
    getJson,
    isIgUrl,
    isUrl,
    getUrl,
    qrcode,
    secondsToDHMS,
    formatBytes,
    sleep,
    clockString,
    runtime,
    AddMp3Meta,
    Mp3Cutter,
    Bitly,
    isNumber,
    getRandom,
    findMusic,
    AItts,
    toAudio,
    pm2Uptime,
    XKCDComic,
    start,
  } = require("../lib/");
  const {
    saveMessage,
    loadMessage,
    saveChat,
    getName,
  } = require("../lib/db/StoreDb");
  const { yta, ytv, ytdlDl, ytdlget, formatYtdata } = require("../lib/functions");
  const util = require("util");
  const config = require("../config");
  const { delay } = require("@whiskeysockets/baileys");
  const { exec } = require('child_process');

  
  Function(
    { on: "text", fromMe: true, desc: "Run js code (evel)", type: "misc", dontAddCommandList: true },
    async (message, match, m, client, msg) => {
      if (message.text.startsWith(">")) {
        const conn = message.client;
        const json = (x) => JSON.stringify(x, null, 2);
        const client = conn;
        try {
          let evaled = await eval(`${message.text.replace(">", "")}`);
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
          await message.reply(evaled);
        } catch (err) {
          await message.reply(util.format(err));
        }
      }
    }
  );
  
  Function(
    { on: "text", fromMe: true, dontAddCommandList: true },
    async (message, match, m, client, msg) => {
      if (message.text.startsWith("<")) {
        var conn = message.client;
        var client = conn;
        const util = require("util");
        const json = (x) => JSON.stringify(x, null, 2);
        try {
          let return_val = await eval(
            `(async () => { ${message.text.replace("$", "")} })()`
          );
          if (return_val && typeof return_val !== "string")
            return_val = util.inspect(return_val);
          if (return_val) await message.send(return_val || "No return value");
        } catch (e) {
          if (e) await message.send(util.format(e));
        }
      }
    }
  );

  Function(
    { on: "text", fromMe: true, dontAddCommandList: true },
    async (message, match, m, client, msg) => {
      if (message.text.startsWith("$")) {

        try {

        exec(match, async (error, stdout, stderr) => {
          if (error) {
            message.reply(`Error executing command: ${error.message}`);
              return;
          }
          if (stderr) {
            message.reply(`Command stderr: ${stderr}`);
              return;
          }
         return await message.reply(`Command output: ${stdout}`);
      });

    } catch (e) {
      if (e) await message.reply(util.format(e));
    }
      } else {return;}
    }
  );


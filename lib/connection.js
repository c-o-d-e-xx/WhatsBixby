/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const pino = require("pino");
const path = require("path");
const fs = require("fs");
const plugins = require("./events");
const {
  default: makeWASocket,
  loadSession,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { PausedChats } = require("./db");
const config = require("../config");
const { serialize, Greetings } = require("./index");
const { Image, Message, Sticker, Video, AllMessage } = require("./base");
const { getcall } = require("./db/callAction");
const {
  loadMessage,
  saveMessage,
  saveChat,
  getName,
} = require("./db/StoreDb");

const logger = pino({ level: "silent" });

const connect = async () => {
  const Aurora = async () => {
    const sessionDir = "./session";
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/session/");
    const { version } = await fetchLatestBaileysVersion();
    const conn = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: true,
      logger,
      browser: Browsers.macOS("Desktop"),
      downloadHistory: false,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      version,
      getMessage: async (key) =>
        (loadMessage(key.id) || {}).message || { conversation: null },
    });

    conn.ev.on("connection.update", handleConnectionUpdate(conn));
    conn.ev.on("creds.update", saveCreds);
    conn.ev.on("group-participants.update", async (data) =>
      Greetings(data, conn)
    );
    conn.ev.on("chats.update", async (chats) =>
      chats.forEach(async (chat) => await saveChat(chat))
    );
    conn.ev.on("messages.upsert", handleMessages(conn));

    process.on("uncaughtException", async (err) => {
      console.log(err);
    });

    conn.ev.on("call", async (c) => {
      const callList = await getcall();
      c = c.map(c => c);
      c = c[0];
      let { status, from, id } = c;
      let frmid;
      if (from.includes(":")) {
        frmid = await from.split(":")[0];
      } else {
        frmid = await from.split("@")[0];
      }
      let res = callList.some(item => item.dataValues && item.dataValues.chatId.split("@")[0] === frmid);
      console.log("[Call from: " + frmid + "]");
      if (status == "offer") {
        if (!res) {
          await conn.rejectCall(id, from);
          return conn.sendMessage(from, {
            text: "Sorry no calls. Please use Text or Voice Message\n> Automated System"
          });
        }
      }
    });

    process.on("uncaughtException", async (err) => {
      await conn.sendMessage(conn.user.id, { text: err.message });
      console.log(err);
    });

    return conn;
  };

  const handleConnectionUpdate = (conn) => async (s) => {
    const { connection, lastDisconnect } = s;
    if (connection === "connecting")
      console.log("Connecting to WhatsApp... Please Wait.");
    else if (connection === "open") {
      console.log("✅ Login Successful!");
      const totalPlugins = plugins.commands.length;
      const workType = config.WORK_TYPE;
      const packageVersion = require("../package.json").version;
      const num = conn.user.id.split(":")[0];
      const str = `\`\`\`----- 𝞓𝙇𝞘𝞢𝞜-𝞓𝙇𝙁𝞓-𝞛𝘿 -----\n\nVersion: ${packageVersion}\nNumber: ${num}\nTotal Plugins: ${totalPlugins}\nWorktype: ${workType}\n\n----- 𝞓𝙇𝞘𝞢𝞜-𝞓𝙇𝙁𝞓-𝞛𝘿 -----\`\`\``;
      return conn.sendMessage(conn.user.id, { text: str });
    } else if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        const statusCode = await lastDisconnect.error?.output?.statusCode;
        await delay(300);
        console.log(
          "Disconnection Reason: " +
            (await DisconnectReason[statusCode] ===
            (await undefined) ? await statusCode : await DisconnectReason[statusCode])
        );
        console.log("Reconnecting...");
        return Aurora();
      } else {
        console.log("Connection closed. Device logged out.");
        await delay(1000);
        return process.send("shutdown");
      }
    }
  };

  const handleMessages = (conn) => async (m) => {
    if (m.type !== "notify") return;
    let msg = await serialize(JSON.parse(JSON.stringify(m.messages[0])), conn);
    await saveMessage(m.messages[0], msg.sender);
    if (config.AUTO_READ) await conn.readMessages(msg.key);
    if (config.AUTO_STATUS_READ && msg.from === "status@broadcast")
      await conn.readMessages(msg.key);
    let text_msg = msg.body;
    if (!msg) return;
    const regex = new RegExp(`${config.HANDLERS}( ?resume)`, "is");
    const isResume = regex.test(text_msg);
    const chatId = msg.from;
    const pausedChats = await PausedChats.getPausedChats();
    if (
      pausedChats.some((pausedChat) => pausedChat.chatId === chatId && !isResume)
    )
      return;
    if (config.LOGS) {
      let namo;
      if (typeof msg.pushName === "string") {
        namo = await msg.pushName.replaceAll("\n", " ");
      } else {
        namo = "";
      }
      const from = msg.from.endsWith("@g.us")
        ? `[ ${(await conn.groupMetadata(msg.from)).subject} ] : ${namo}`
        : await namo;
      console.log(`-------------\n${await from} : ${await text_msg}`);
    }
    var whats;
    plugins.commands.map(async (command) => {
      if (command.fromMe && !msg.sudo) return;
      const handleCommand = (Instance, args) => {
        whats = new Instance(conn, msg);
        command.function(whats, ...args, msg, conn, m);
      };
      if (text_msg && command.pattern) {
        let iscommand = text_msg.match(command.pattern);
        if (iscommand) {
          let [, prefix, , match] = iscommand;
          match = match ? match : false;
          msg.prefix = prefix;
          msg.command = [prefix, iscommand[2]].join("");
          handleCommand(Message, [match]);
        }
      } else {
        switch (command.on) {
          case "text":
            if (text_msg) handleCommand(Message, [text_msg]);
            break;
          case "image":
            if (msg.type === "imageMessage") handleCommand(Image, [text_msg]);
            break;
          case "sticker":
            if (msg.type === "stickerMessage") handleCommand(Sticker, []);
            break;
          case "video":
            if (msg.type === "videoMessage") handleCommand(Video, []);
            break;
          case "delete":
            if (msg.type === "protocolMessage") {
              whats = new Message(conn, msg);
              whats.messageId = msg.message.protocolMessage.key?.id;
              command.function(whats, msg, conn, m);
            }
            break;
          case "message":
            handleCommand(AllMessage, []);
            break;
          default:
            break;
        }
      }
    });
  };

  try {
    return Aurora();
  } catch (error) {
    console.error("Aurora function error:", error);
  }
};

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Exiting...");
  process.exit(0);
});

module.exports = connect;

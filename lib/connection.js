const pino = require("pino");
const path = require("path");
const fs = require("fs");
const plugins = require("./events");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { getPausedChats } = require("./db/pausedchat");
const config = require("../config");
const { serialize } = require("./index");
const { Greetings } = require("./index");
const { Image, Message, Sticker, Video, AllMessage } = require("./base");
const io = require("socket.io-client");
const { loadMessage, saveMessage, saveChat, getName, getcall } = require("./db");

const logger = pino({ level: "silent" });

const handleConnectionUpdate = (conn, ws) => async (s) => {
  const { connection, lastDisconnect } = s;
  if (connection === "connecting") {
    console.log("Connecting to WhatsApp... Please Wait.");
  } else if (connection === "open") {
    console.log("✅ Login Successful!");
    const totalPlugins = plugins.commands.length;
    const workType = config.WORK_TYPE;
    const packageVersion = require("../package.json").version;
    const num = conn.user.id.split(":")[0];
    const str = `\`\`\`----- 𝞓𝙇𝞘𝞢𝞜-𝞓𝙇𝙁𝞓-𝞛𝘿 -----\n\nVersion: ${packageVersion}\nNumber: ${num}\nTotal Plugins: ${totalPlugins}\nWorktype: ${workType}\n\n----- 𝞓𝙇𝞘𝞢𝞜-𝞓𝙇𝙁𝞓-𝞛𝘿 -----\`\`\``;
    await conn.sendMessage(conn.user.id, { text: str });
  } else if (connection === "close") {
    if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      const statusCode = lastDisconnect.error?.output?.statusCode;
      await delay(300);
      console.log("Disconnection Reason: " + (DisconnectReason[statusCode] || statusCode));
      console.log("Reconnecting...");
      return connect();
    } else {
      console.log("Connection closed. Device logged out.");
      await delay(1000);
      if (process.send) {
        process.send('shutdown');
      } else {
        process.exit(0);
      }
    }
  }
};

const handleMessages = (conn, ws) => async (m) => {
  if (m.type !== "notify") return;

  let msg = await serialize(JSON.parse(JSON.stringify(m.messages[0])), conn);
  await saveMessage(m.messages[0], msg.sender);  // Save the incoming message

  if (config.AUTO_READ) await conn.readMessages(msg.key);
  if (config.AUTO_STATUS_READ && msg.from === "status@broadcast") {
    await conn.readMessages(msg.key);
  }

  let text_msg = msg.body;
  if (!msg) return;

  const regex = new RegExp(`${config.HANDLERS}( ?resume)`, "is");
  const isResume = regex.test(text_msg);
  const chatId = msg.from;
  const pausedChats = await getPausedChats();

  if (pausedChats.some((pausedChat) => pausedChat.chatId === chatId && !isResume)) {
    return;
  }

  if (config.LOGS) {
    let namo;
    if (typeof msg.pushName === 'string') {
      namo = msg.pushName.replaceAll("\n", " ");
    } else {
      namo = "";
    }
    const from = msg.from.endsWith("@g.us") ? `[ ${(await conn.groupMetadata(msg.from)).subject} ] : ${namo}` : namo;
    console.log(`-------------\n${from} : ${text_msg}`);
  }

  plugins.commands.forEach(async (command) => {
    if (command.fromMe && !msg.sudo) return;

    const handleCommand = (Instance, args) => {
      const whats = new Instance(conn, msg);
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
            const whats = new Message(conn, msg);
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

const connect = async () => {
  const sessionDir = "./lib/temp/session";
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__basedir, sessionDir)
  );

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
      (await loadMessage(key.id))?.message || { conversation: null },
  });

  const ws = io("https://socket.xasena.me/", { reconnection: true });
  ws.on("connect", () => console.log("Connected to server"));
  ws.on("disconnect", () => console.log("Disconnected from server"));

  conn.ev.on("connection.update", handleConnectionUpdate(conn, ws));
  conn.ev.on("creds.update", saveCreds);
  conn.ev.on("group-participants.update", async (data) => Greetings(data, conn));
  conn.ev.on("chats.update", async (chats) => {
    for (const chat of chats) {
      await saveChat(chat);
    }
  });
  conn.ev.on("messages.upsert", handleMessages(conn, ws));

  process.on("uncaughtException", async (err) => {
    console.log(err);
  });

  conn.ev.on("call", async (c) => {
    try {
      const callList = await getcall();
      const isAllBlocked = callList.some(item => item.chatId === "all");

      c = c.map(call => call);
      c = c[0];
      let { status, from, id } = c;
      let frmid;

      if (from.includes(":")) {
        frmid = from.split(":")[0];
      } else {
        frmid = from.split("@")[0];
      }

      const isBlocked = isAllBlocked || callList.some(item => item.chatId.split("@")[0] === frmid);

      console.log("[Call from: " + frmid + "]");
      if (status === "offer") {
        if (isBlocked) {
          await conn.rejectCall(id, from);
          await conn.sendMessage(from, {
            text: "Sorry, calls are blocked. Please use text or voice messages.\n> Automated System"
          });
        } else {
          console.log("Call allowed from: " + frmid);
        }
      }
    } catch (error) {
      console.error("Error handling call event:", error);
    }
  });
};

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Exiting...");
  process.exit(0);
});

module.exports = connect;
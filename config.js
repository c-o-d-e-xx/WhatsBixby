const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "lib/config.env") });
const toBool = (x) => x === "true";

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || "",
  BASE_URL: process.env.BASE_URL || "https://dxmods.xyz/",
  API_KEY: process.env.API_KEY || "", 
  ANTILINK: toBool(process.env.ANTI_LINK) || false,
  LOGS: toBool(process.env.LOGS) || true,
  ANTILINK_ACTION: process.env.ANTI_LINK || "kick",
  SESSION_ID: process.env.SESSION_ID === undefined ? "" : process.env.SESSION_ID,
  LANG: process.env.LANG || "EN",
  AUTH_TOKEN: "",
  HANDLERS: process.env.HANDLER === "false" || process.env.HANDLER === "null"  || process.env.HANDLER === undefined ? "^" : process.env.HANDLER,
  RMBG_KEY: process.env.RMBG_KEY || false,
  BRANCH:process.env.WARN_COUNT || "master",
  WARN_COUNT:process.env.WARN_COUNT || 3,
  WELCOME_MSG: process.env.WELCOME_MSG || "Hi @user Welcome to @gname",
  GOODBYE_MSG: process.env.GOODBYE_MSG || "@user Left The Group",
  PACKNAME: process.env.PACKNAME || "𝙒𝞖𝞓𝙏𝙎𝞑𝞘𝞦𝞑𝙔",
  AUTHOR: process.env.AUTHOR || "𝘾𝞗𝘿𝞢𝞦",
  SUDO: process.env.SUDO || "919446072492",
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
  OWNER_NAME: process.env.OWNER_NAME || "𝙕𝞘𝙔𝞓𝞜",
  HEROKU: toBool(process.env.HEROKU) || false,
  BOT_NAME: process.env.BOT_NAME || "𝙒𝞖𝞓𝙏𝙎𝞑𝞘𝞦𝞑𝙔",
  WORK_TYPE: process.env.WORK_TYPE || "private",
  SESSION_URL: process.env.SESSION_URL || "",
  DELETED_LOG_CHAT: "120363084228202932@g.us",
  DELETED_LOG: toBool(process.env.DELETED_LOG) || false,
  GEMINI_API: process.env.GEMINI_API === undefined ? false :  process.env.GEMINI_API,
};
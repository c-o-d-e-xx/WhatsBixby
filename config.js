/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Sequelize } = require("sequelize");
const { existsSync } = require('fs')
const path = require('path')
const configPath = path.join(__dirname, './config.env')
if (existsSync(configPath)) require('dotenv').config({ path: configPath })
const toBool = (x) => x === "true";
const DATABASE_URL = process.env.DATABASE_URL || "./lib/db/database.db";

module.exports = {  
  BASE_URL : "https://dxmods.xyz/",
  API_KEY: process.env.API_KEY || "L5Ce7iyZng", //login here and get api key https://dxmods.xyz/login
  SESSION_VALIDATOR : "https://dxmods.xyz/",
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
  PACKNAME: process.env.PACKNAME || "ᴡʜᴀᴛꜱ",
  AUTHOR: process.env.AUTHOR || "ʙɪxʙʏ",
  SUDO: process.env.SUDO || "919446072492",
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
  OWNER_NAME: process.env.OWNER_NAME || "Ziyan",
  HEROKU: toBool(process.env.HEROKU) || false,
  BOT_NAME: process.env.BOT_NAME || "ᴡʜᴀᴛꜱ ʙɪxʙʏ",
  BOT_IMG : "https://envs.sh/8rA.jpg",
  WORK_TYPE: process.env.WORK_TYPE || "public",
  SESSION_URL: process.env.SESSION_URL || "",
  DELETED_LOG_CHAT: "120363084228202932@g.us",
  DELETED_LOG: toBool(process.env.DELETED_LOG) || false,
  GEMINI_API: process.env.GEMINI_API === undefined ? false :  process.env.GEMINI_API,
  DATABASE_URL: DATABASE_URL,
  DATABASE:
    DATABASE_URL === "./lib/db/database.db"
      ? new Sequelize({
          dialect: "sqlite",
          storage: DATABASE_URL,
          logging: false,
        })
      : new Sequelize(DATABASE_URL, {
          dialect: "postgres",
          ssl: true,
          protocol: "postgres",
          dialectOptions: {
            native: true,
            ssl: { require: true, rejectUnauthorized: false },
          },
          logging: false,
        }),
};

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const got = require("got");
const Heroku = require("heroku-client");
const { Bixby, isPrivate, secondsToDHMS } = require("../lib/");
const Config = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const { delay } = require("@whiskeysockets/baileys");

Bixby(
  {
    pattern: "restart",
    fromMe: true,
    type: "heroku",
    desc: "Restart Dyno",
    type: "heroku",
  },
  async (message) => {
    await message.reply(`_Restarting..._`);
    if (Config.HEROKU) {
      if (Config.HEROKU_APP_NAME === "") {
        return await message.reply("Add `HEROKU_APP_NAME` env variable");
      }
      if (Config.HEROKU_API_KEY === "") {
        return await message.reply("Add `HEROKU_API_KEY` env variable");
      }
      await heroku.delete(baseURI + "/dynos").catch(async (error) => {
        await message.reply(`HEROKU : ${error.body.message}`);
      });
    } else {
      return await process.send("reset")
    }
  }
);
Bixby(
  {
    pattern: "shutdown",
    fromMe: true,
    type: "heroku",
    desc: "Dyno off",
    type: "heroku",
  },
  async (message) => {
    if (Config.HEROKU) {
      if (Config.HEROKU_APP_NAME === "") {
        return await message.reply("Add `HEROKU_APP_NAME` env variable");
      }
      if (Config.HEROKU_API_KEY === "") {
        return await message.reply("Add `HEROKU_API_KEY` env variable");
      }
      await heroku
        .get(baseURI + "/formation")
        .then(async (formation) => {
          await message.reply(`_Shutting down._`);
          await heroku.patch(baseURI + "/formation/" + formation[0].id, {
            body: {
              quantity: 0,
            },
          });
        })
        .catch(async (error) => {
          await message.reply(`HEROKU : ${error.body.message}`);
        });
    } else {
      await message.reply(`_Shutting down!_`);
      await delay(1000).then(() =>  process.send("Kill")
    );
    }
  }
);

Bixby(
  {
    pattern: "dyno",
    fromMe: isPrivate,
    desc: "Show Quota info",
    type: "heroku",
  },
  async (message) => {
    if (!Config.HEROKU)
      return await message.reply("You are not using Heroku as your server.");

    if (Config.HEROKU_APP_NAME === "")
      return await message.reply("Add `HEROKU_APP_NAME` env variable");
    if (Config.HEROKU_API_KEY === "")
      return await message.reply("Add `HEROKU_API_KEY env variable");

    try {
      heroku
        .get("/account")
        .then(async (account) => {
          const url = `https://api.heroku.com/accounts/${account.id}/actions/get-quota`;
          headers = {
            "User-Agent": "Chrome/80.0.3987.149 Mobile Safari/537.36",
            Authorization: "Bearer " + Config.HEROKU_API_KEY,
            Accept: "application/vnd.heroku+json; version=3.account-quotas",
          };
          const res = await got(url, { headers });
          const resp = JSON.parse(res.body);
          const total_quota = Math.floor(resp.account_quota);
          const quota_used = Math.floor(resp.quota_used);
          const remaining = total_quota - quota_used;
          const quota = `Total Quota : ${secondsToDHMS(total_quota)}
Used  Quota : ${secondsToDHMS(quota_used)}
Remaning    : ${secondsToDHMS(remaining)}`;
          await message.reply("```" + quota + "```");
        })
        .catch(async (error) => {
          return await message.reply(`HEROKU : ${error.body.message}`);
        });
    } catch (error) {
      await message.reply(error);
    }
  }
);

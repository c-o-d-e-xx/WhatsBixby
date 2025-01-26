/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib/");
const { BASE_URL, API_KEY } = require("../config");
const axios = require('axios')

Bixby(
  {
    pattern: "npm",
    fromMe: isPrivate,
    desc: "Searches Npm package",
    type: "search",
  },
async (message, match) => {
match = match || message.reply_message.text;
if (!match) return await message.reply("*_Enter npm package name!_*");
axios.get(`${BASE_URL}search/npm?text=${match}&apikey=${API_KEY}`).then(({ data }) => {
let txt = data.result.results.map(({ package: pkg }) => `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`).join('\n\n')
message.reply(txt)
}).catch(e => console.log(e))
});

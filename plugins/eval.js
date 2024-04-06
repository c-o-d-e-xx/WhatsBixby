const{Module}=require('../lib');
const lib = require('../lib');
const util = require("util");
const Config = require("../config")
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

Module({
                on: "all",
                fromMe :true,
                onlyPm :false,
                onlyGroup :false,
		pattern: 'eval',
		desc: 'this send evaled data for your request',
                type : "owner"
	   },
	async (message, Texts, cmd, chatUpdate) => {
    let m = message, sock = c = conn = message.client;
    if(!message.body.trim().startsWith('>')) return;
    let match = message.body.replace('>','').trim();let text = match;
    try {
      let evaled = await eval(`(async () => { ${match} })()`);
      if (typeof match !== "string") evaled = await util.inspect(evaled);
      await message.reply(evaled);
    } catch (err) {
      await message.reply(util.format(err));
    }
});

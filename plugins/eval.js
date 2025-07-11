const{Bixby}=require('../lib');
const {
    extensionForMediaMessage,
    extractMessageContent,
    jidNormalizedUser,
    getContentType,
    normalizeMessageContent,
    proto,
    delay,
    areJidsSameUser,
    downloadContentFromMessage,
    getBinaryNodeChild,
    WAMediaUpload,
    generateForwardMessageContent,
    generateLinkPreviewIfRequired,
    generateWAMessageFromContent,
    getBinaryNodeChildren
  } = require("@c-o-d-e-xx/baileys-revamped");
const bs = require("@c-o-d-e-xx/baileys-revamped");
const lib = require('../lib');
const util = require("util");
const Config = require("../config")
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

Bixby({
                on: "all",
                pattern: '>',
                fromMe :true,
                type : "owner"
	   },
	async (message, Texts, cmd, chatUpdate) => {
    let m = message, sock = c = conn = message.client;
    let match = message.body.replace('>','').trim();let text = match;
    try {
      let evaled = await eval(`(async () => { ${match} })()`);
      if (typeof match !== "string") evaled = await util.inspect(evaled);
      await message.reply(evaled);
    } catch (err) {
      await message.reply(util.format(err));
    }
});

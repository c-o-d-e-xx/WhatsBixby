/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    MODE,
    badWordDetect,
    linkPreview,
    getJson,
    config
} = require("../lib");
const fs = require("fs");


Bixby({
    pattern: "img",
    react: "🖼",
    fromMe: MODE,
    type: "search",
    desc : 'download image'
}, async (message, match) => {
    if (!match) return await message.send('_please give me a text_',{linkPreview: linkPreview()})
    if(badWordDetect(match.toLowerCase()) && !message.isCreator) return await message.send('_invalid attempt_',{linkPreview: linkPreview()})
    let [text,number] = match.split(/[;,|]/)
    if(!text) text = match;
    if(!number) number = 1;
    if(number>3 && !message.isCreator) return await message.send('_invalid attempt_',{linkPreview: linkPreview()})
    const data = await getJson(config.BASE_URL+'api/search/gis?text='+text+`&count=${number}&apikey=${config.INRL_KEY}`);
    const {result} = data;
    if(!data.status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
    if(!result) return await message.send('_Not Found_');
    result.map(async(url)=>{
    return await message.sendReply(url,{caption:'*result for*: ```'+text+"```"},'image');
    });
});

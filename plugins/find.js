/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {Bixby , isPrivate , getBuffer} = require("../lib/");
const ytsr = require('ytsr');
const acrcloud = require("acrcloud")

Bixby(
    {
      pattern: "find",
      fromMe: true,
      desc: "Find the music",
      type: "tools",
    },
    async (message, match, m) => {

  try{
 if (!m.quoted.message.videoMessage && !m.quoted.message.audioMessage)
      return await message.sendMessage("*Need Video! Or Audio*");
    
 let buff = await m.quoted.download()
try{
     const acr = new acrcloud({
        host: "identify-eu-west-1.acrcloud.com",
        access_key: "df8c1cffbfa4295dd40188b63d363112",
        access_secret: "d5mygczEZkPlBDRpFjwySUexQM26jix0gCmih389"
});


let res = await acr.identify(buff)


let {code , msg}  = res.status
if(code !== 0) return await message.reply(msg)

const {album} = res.metadata.music[0]
    
const rex = await syt(album?.name)

const { type, title, url, views, duration, uploadedAt, author, bestThumbnail } = rex;
const { name, url: authorUrl, verified } = author;


let im = await getBuffer(bestThumbnail.url)
    let  text = `Type: ${type}
Title: ${title}
Album: ${album?.name}
Views: ${views}
Duration: ${duration}
Uploaded At: ${uploadedAt}
Author: ${name}
Author URL: ${authorUrl}
Verified: ${verified ? 'Yes' : 'No'}
`;
     return await message.client.sendMessage(message.jid, {image: im, caption: text}, {quoted: message})
 }catch(e){
console.log(e)
return; // Stop execution if an error occurs
}
 
} catch (error) {
  console.error("[Error]:", error);
}

})
async function syt(res){
const filters = await ytsr.getFilters(res);
    const filter = filters.get('Type').get('Video');
    const options = {
      limit: 1, // Retrieve only the first result
    };
const sr = await ytsr(filter.url , options);
  return sr.items[0]
}

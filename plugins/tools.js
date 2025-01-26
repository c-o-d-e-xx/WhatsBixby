/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
  Bixby,
  isPrivate,
  qrcode,
  Bitly,
  isUrl,
  readQR,
  getMemoryUsage,
  MimeTypes,
  getJson,
} = require("../lib/");
const fetch = require('node-fetch')

const { downloadMediaMessage } = require("@whiskeysockets/baileys");

Bixby(
  {
   pattern: "vv",
   fromMe: isPrivate,
   desc: "Forwards The View once messsage",
   type: "tool",
  },
  async (message, match, m) => {
   try{
 function _0x3c2f(){const _0x454ae1=['590zvrRah','276MPUpfG','1030047bYOspa','client','132lPCSLj','quoted','72035GsMWwB','964995FMOqKn','77994EtoDcn','sendFile','594256umecHW','2DKkSmy','376328mtwIim','updateMediaMessage','133859YAuynf','56RBJvKE','buffer'];_0x3c2f=function(){return _0x454ae1;};return _0x3c2f();}const _0x136909=_0x9093;function _0x9093(_0x20e9c8,_0x4ae34e){const _0x3c2f3b=_0x3c2f();return _0x9093=function(_0x9093b,_0x280edf){_0x9093b=_0x9093b-0x1a3;let _0x5242e1=_0x3c2f3b[_0x9093b];return _0x5242e1;},_0x9093(_0x20e9c8,_0x4ae34e);}(function(_0x2f64e4,_0x467dcc){const _0x52b0a2=_0x9093,_0x1921f8=_0x2f64e4();while(!![]){try{const _0x48729d=parseInt(_0x52b0a2(0x1b0))/0x1+parseInt(_0x52b0a2(0x1a3))/0x2*(parseInt(_0x52b0a2(0x1ab))/0x3)+parseInt(_0x52b0a2(0x1b3))/0x4+parseInt(_0x52b0a2(0x1af))/0x5*(-parseInt(_0x52b0a2(0x1aa))/0x6)+-parseInt(_0x52b0a2(0x1a7))/0x7*(-parseInt(_0x52b0a2(0x1a4))/0x8)+parseInt(_0x52b0a2(0x1b1))/0x9*(-parseInt(_0x52b0a2(0x1a9))/0xa)+-parseInt(_0x52b0a2(0x1a6))/0xb*(parseInt(_0x52b0a2(0x1ad))/0xc);if(_0x48729d===_0x467dcc)break;else _0x1921f8['push'](_0x1921f8['shift']());}catch(_0x2b6a24){_0x1921f8['push'](_0x1921f8['shift']());}}}(_0x3c2f,0x80431));const {downloadMediaMessage}=require('@whiskeysockets/baileys'),buffer=await downloadMediaMessage(m[_0x136909(0x1ae)],_0x136909(0x1a8),{},{'reuploadRequest':message[_0x136909(0x1ac)][_0x136909(0x1a5)]});return await message[_0x136909(0x1b2)](buffer);
 } catch (error) {
   console.error("[Error]:", error);
 }
 }
 );

Bixby(
  {
    pattern: "fetch ?(.*)",
    fromMe: isPrivate,  
    desc: "Downloads from a direct link",
    type: "downloader",
  },
  async (message, match) => {
    try{
    match = match || message.reply_message.text;
    if (!match)
      return message.reply(
        "_Send a direct media link_\n_*link;caption(optional)*_"
      );
    try {
      let url = match.split(";")[0];
      let options = {};
      options.caption = match.split(";")[1];

      if (isUrl(url)) {
        message.sendFromUrl(url, options);
      } else {
        message.reply("_Not a URL_");
      }
    } catch (e) {
      console.log(e);
      message.reply("_No content found_");
    }
    return await message.reply(participants);
    } catch (error) {
      console.error("[Error]:", error);
    }
    
  }
);


Bixby(
  {
    pattern: "qr",
    fromMe: isPrivate,
    desc: "Read/Write Qr.",
    type: "Tool",
  },
  async (message, match, m) => {
    match = match || (message.reply_message && message.reply_message.text);

    if (match) {
      let buff = await qrcode(match);
      return await message.sendMessage(message.jid, buff, {}, "image");
    } else if (!message.reply_message || !message.reply_message.image) {
      return await message.sendMessage(
        message.jid,
        "*Example : qr test*\n*Reply to a qr image.*"
      );
    }

    const buffer = await downloadMediaMessage(
      message.reply_message,
      "buffer",
      {},
      {
        reuploadRequest: message.client.updateMediaMessage,
      }
    );
    readQR(buffer)
      .then(async (data) => {
        return await message.sendMessage(message.jid, data);
      })
      .catch(async (error) => {
        console.error("Error:", error.message);
        return await message.sendMessage(message.jid, error.message);
      });
  }
);

Bixby(
  {
    pattern: "bitly ?(.*)",
    fromMe: isPrivate,
    desc: "Converts Url to bitly",
    type: "tool",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("_Reply to a url or enter a url_");
    if (!isUrl(match)) return await message.reply("_Not a url_");
    let short = await Bitly(match);
    return await message.reply(short.link);
  }
);

Bixby(
  {
    pattern: "usage ?(.*)",
    fromMe: true,
    desc: "shows memory usage",
    type: "tool",
  },
  async (message, match) => {
    var { key } = await message.reply("_Procesing that request!_");
    let tex = await getMemoryUsage()
    return await message.client.sendMessage(message.jid, { text: tex, edit: key });
  });

Bixby(
  {
    pattern: "getqr ?(.*)",
    fromMe: isPrivate,  
    desc: "Get connection QR",
    type: "misc",
  },
  async (message, match) => {
    try{
    for (let index = 0; index < 4; index++) {
      await sleep(30 * 1000);
      await message.sendFromUrl("alienalfa.xyz/qr", {
        caption: "Scan within 30 seconds",
      });
    }
    return await message.reply("Your session is OVER");
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

Bixby(
  {
    pattern: "get ?(.*)",
    fromMe: true,  
    desc: "Get any file form the bot with the correct path",
    type: "misc",
  },
  async (message, match) => {
    try{
      console.log(match)
     return await sendFileOrFolder(message, match)


  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

Bixby(
  {
    pattern: "doc",
    fromMe: isPrivate,
    desc: "Convert file to document",
  },
  async (message, match, m) => {
    try {
      if(!m.quoted) return;
      let ext = await MimeTypes(m.quoted.text.mimetype)
      return await message.client.sendMessage(message.jid, {
        document: {url: m.quoted.text.url}, 
        fileName: "Document."+ext,
        mimetype: m.quoted.text.mimetype,
      }); 
    } catch (error) {
      console.error("[Error]:", error);
    }
  }
);

Bixby(
  {
    pattern: "git",
    fromMe: isPrivate,
    desc: "get the zip of git repo (Public)",
  },
  async (message, match, m) => {
    try {
      match = match || message.reply_message.text;
      if (!match) return await message.reply("_Reply to a url or enter a url_");
      if (!match.includes('github.com')) return await message.reply(`Link invalid!!`)
        let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
      let [, user, repo] = match.match(regex1) || []
      repo = repo.replace(/.git$/, '')
      let url = `https://api.github.com/repos/${user}/${repo}/zipball`
      let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
      return await message.client.sendMessage(message.jid, { document: { url: url }, fileName: filename, mimetype: 'application/zip' }, { quoted: m }).catch((err) => message.reply(err))

    } catch (error) {
      console.error("[Error]:", error);
    }
  }
);

const fs = require('fs');
const archiver = require('archiver');

async function sendFileOrFolder(message, filepath) {

    try {
        const stats = await fs.promises.stat(filepath);

        if (stats.isDirectory()) {
            // If it's a directory, create a zip file
            const zipFileName = filepath + '.zip';
            const output = fs.createWriteStream(zipFileName);
            const archive = archiver('zip');

            output.on('close', () => {
                // Send the zip file
                message.client.sendMessage(message.jid, {
                    document: fs.readFileSync(zipFileName),
                    fileName: zipFileName,
                    mimetype: 'application/zip',
                });

                // Delete the temporary zip file
                fs.unlinkSync(zipFileName);
            });

            archive.pipe(output);
            archive.directory(filepath, false);
            archive.finalize();
        } else if (stats.isFile()) {
            // If it's a file, send the file directly
            const filename = filepath.split('/').pop(); // Extract filename from the path
            const mimeType = getMimeType(filename);

            message.client.sendMessage(message.jid, {
                document: fs.readFileSync(filepath),
                fileName: filename,
                mimetype: mimeType,
            });
        } else {
            // Not a valid file or directory
            throw new Error('Invalid file or directory');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to determine mime type based on file extension
function getMimeType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'txt':
            return 'text/plain';
        case 'json':
            return 'application/json';
        case 'js':
            return 'text/javascript';
        case 'db':
            return 'application/x-sqlite3';
        default:
            return 'application/octet-stream'; // Default mime type
    }
}

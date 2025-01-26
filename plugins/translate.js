/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib");
 
// Made with ❤ by AlienAlfa
const {
    translate
  } = require('@vitalets/google-translate-api');
  const defaultLang = 'en'
  
  Bixby({
       pattern: "trt",
       fromMe: isPrivate,  
       desc: "Google Translate",
       dontAddCommandList: true,
       type: "tool",
  
    },
    async (message, match, m) => {
      try{

        
        let args = match.split(" ");
let lang = args[0];
let text = args.slice(1).join(" ");
if (lang.length !== 2) {
  lang = defaultLang;
  text = args.join(" ");
}
if (!text && m.quoted && m.quoted.text) {
  text = m.quoted.text;
}
let result = await translate(text, {
  to: lang,
  autoCorrect: true
}).catch(() => null);
message.sendMessage(result.text);


    } catch (error) {
      console.error("[Error]:", error);
    }
    })
// Made with ❤ by AlienAlfa

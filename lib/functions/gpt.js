/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const axios = require("axios");
const parsePhoneNumber = require("awesome-phonenumber");
const fs = require('fs');

async function clear() {
  if(!fs.existsSync('./lib/database/gpt.json')) return false
  fs.unlinkSync('./lib/database/gpt.json');
  return true;
}

async function interactWithAI(userPrompt,OPEN_AI) {
    try {
        let messageData = { 'messages': [] };
        if(fs.existsSync('./lib/database/gpt.json')){
          messageData = JSON.parse(fs.readFileSync('./lib/database/gpt.json'));
        }
        if(!OPEN_AI) return '*provide a gpt key*\n_*add your* <key> *on config.js*_\n*example*\n_setvar open_ai: sk-**************yth_';
        let systemMessage = "history:" + messageData.messages.map(m => `${m.role} [${m.timestamp}]: ${m.content}`).join("\n");
        let response = await axios({
            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: { 'Authorization': `Bearer ${OPEN_AI.trim()}`, 'Content-Type': 'application/json' },
            data: { 'model': 'gpt-3.5-turbo', 'messages': [ { "role": "system", "content": systemMessage }, { "role": "user", "content": userPrompt } ] }
        });
        let timestamp = new Date().toISOString();
        messageData.messages.push({ "role": "user", "content": userPrompt, "timestamp": timestamp });
        messageData.messages.push({ "role": "assistant", "content": response.data.choices[0].message.content, "timestamp": timestamp });
        fs.writeFileSync('./lib/database/gpt.json', JSON.stringify(messageData, null, 2))
        return response.data.choices[0].message.content;
    } catch (e) {
        return e?.response?.data?.error?.message ? e.response.data.error.message : e
    }
}

const GPT = {
    set: async(key)=>await setGPTkey(key),
    prompt: async(prompt) => await interactWithAI(prompt),
    clear: async() => await clear()
}

module.exports = { GPT };

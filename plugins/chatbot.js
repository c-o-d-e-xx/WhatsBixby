/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
        Bixby,
        getJson,
        MODE
} = require("../lib");

const { CHATBOT, BRAINSHOP} = require("../config");


Bixby({
        on: 'text',
        fromMe: MODE
}, async (m, match) => {
        //if(m.isCreator) return;
        if(CHATBOT == 'true') {
                let data = await getJson(
                        `http://api.brainshop.ai/get?bid=${BRAINSHOP.split(/[,;|]/)[0]}&key=${BRAINSHOP.split(/[,;|]/)[1]}&uid=[${m.sender.split('@')[0]}]&msg=[${m.body}]`
                )
                return await m.reply(data.cnt)
        } else if(CHATBOT == 'group' && m.isGroup) {
                let data = await getJson(
                        `http://api.brainshop.ai/get?bid=${BRAINSHOP.split(/[,;|]/)[0]}&key=${BRAINSHOP.split(/[,;|]/)[1]}&uid=[${m.sender.split('@')[0]}]&msg=[${m.body}]`
                )
                return await m.reply(data.cnt)
        } else if(CHATBOT == 'pm' && !m.isGroup) {
                let data = await getJson(
                        `http://api.brainshop.ai/get?bid=${BRAINSHOP.split(/[,;|]/)[0]}&key=${BRAINSHOP.split(/[,;|]/)[1]}&uid=[${m.sender.split('@')[0]}]&msg=[${m.body}]`
                )
                return await m.reply(data.cnt)
        }
});

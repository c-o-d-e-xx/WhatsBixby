/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
       Bixby,
       MODE
} = require("../lib");


Bixby({
    pattern: 'ping ?(.*)',
    desc: 'check bot speed',
    react: "💯",
    fromMe: MODE,
    type: 'info'
}, async (message, match) => {
    const start = new Date().getTime()
    const msg = await message.send('Ping!')
    const end = new Date().getTime()
    return await msg.edit('*⚡PONG!* ' + (end - start) + ' ms');
});

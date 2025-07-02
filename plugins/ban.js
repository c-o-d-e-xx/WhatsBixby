/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby } = require("../lib");
const { personalDB } = require("../lib/db");

const {
    exec
} = require("child_process");

Bixby({
    pattern: 'ban ?(.*)',
    desc: 'deactivate bot in specified jid',
    type: 'owner',
    root: true
}, async (message, match) => {
    const {
        ban
    } = await personalDB(['ban'], {
        content: {}
    }, 'get');
    if (ban && ban.includes(message.jid)) return await message.send("_already deactivated bot in this jid!_");
    const update = ban ? ban + ',' + message.jid : message.jid;
    await personalDB(['ban'], {
        content: update
    }, 'set');
    await message.send('*bot deactivated in this jid⚫️*');
    return exec('pm2 restart all')
});

Bixby({
    pattern: 'unban ?(.*)',
    desc: 'activate bot in deactivated bot jid',
    type: 'owner',
    root: true
}, async (message, match) => {
    const {
        ban
    } = await personalDB(['ban'], {
        content: {}
    }, 'get');
    if (!ban) return await message.send("_bot is not disabled in any jid_");
    if (ban && !ban.includes(message.jid)) return await message.send("_bot not deactivated in this jid_");
    let update = [];
    ban.split(',').map(a => {
        if (a != message.jid) update.push(a);
    });
    await personalDB(['ban'], {
        content: update.join("")
    }, 'set');
    await message.send('*bot activated in this jid*\n*restarting!*');
    return exec('pm2 restart all')
});

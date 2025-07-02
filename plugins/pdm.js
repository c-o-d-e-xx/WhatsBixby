/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    config
} = require("../lib");
const { groupDB } = require("../lib/db");

Bixby({
    pattern: 'pdm ?(.*)',
    desc: 'promote, demote message',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('pdm on/off');
    if (match != 'on' && match != 'off') return message.reply('pdm on');
    const {pdm} = await groupDB(['pdm'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (pdm == 'true') return message.reply('_Already activated_');
        await groupDB(['pdm'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_activated_')
    } else if (match == 'off') {
        if (pdm == 'false') return message.reply('_Already Deactivated_');
        await groupDB(['pdm'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_deactivated_')
    }
});

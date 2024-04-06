const {
    Module,
    getWarn,
    lang,
    isAdmin,
    isBotAdmin,
    config
} = require('../lib');


Module({
    pattern: 'warn ?(.*)',
    desc: lang.WARN.DESC,
    type: 'action',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
    if (!match && !message.reply_message.sender) return await message.reply(lang.WARN.METHODE.format('warn', 'warn', 'warn'));
    if (match == 'get') {
        const {
            warn
        } = await getWarn(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        if (!Object.keys(warn)[0]) return await message.reply('_Not Found!_');
        let msg = '';
        for (const f in warn) {
            msg += `_*User:* @${f}_\n_*Count:* ${warn[f].count}_\n_*Remaining:* ${config.WARNCOUND - warn[f].count}`;
        }
        return await message.send(msg, {mentions: [message.reply_message.sender], quoted: message });
    } else if (match == 'reset') {
        if (!message.reply_message.sender) return await message.reply(lang.BASE.NEED.format('user'));
        const {
            warn
        } = await getWarn(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        if (!Object.keys(warn)[0]) return await message.reply('_Not Found!_');
        if (!Object.keys(warn).includes(message.reply_message.number)) return await message.reply('_User Not Found!_');
        await getWarn(['warn'], {
            jid: message.jid,
            content: {
                id: message.reply_message.number
            }
        }, 'delete');
        return await message.reply('_Warn reset Successfully_');
    } else {
        const BotAdmin = await isBotAdmin(message);
        const admin = await isAdmin(message);
        if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
        if (config.ADMIN_SUDO_ACCESS != 'true' && !message.isCreator) return await message.reply(lang.BASE.NOT_AUTHR)
        if (!admin && !message.isCreator) return await message.reply(lang.BASE.NOT_AUTHR)
        if (!message.reply_message.sender) return await message.reply(lang.BASE.NEED.format('user'));
        const reason = match || 'warning';
        const {
            warn
        } = await getWarn(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        const count = Object.keys(warn).includes(message.reply_message.number) ? Number(warn[message.reply_message.number].count) + 1 : 1;
        await getWarn(['warn'], {
                jid: message.jid,
                content: {
                    [message.reply_message.number]: {
                        count
                    }
                }
            },
            'add');
        const remains = config.WARNCOUND - count;
                let warnmsg = `╭─❏ ❮ *ᴡᴀʀɴɪɴɢ* ❯ ❏
│ _*ᴜsᴇʀ : @${message.reply_message.number}⁩*_
│ _*ᴡᴀʀɴ : ${count}*_
│ _*ʀᴇᴀsᴏɴ : ${reason}*_
│ _*ʀᴇᴍᴀɪɴɪɴɢ : ${remains}*_
╰─❏`
        await message.send(warnmsg, {
            mentions: [message.reply_message.sender], quoted: message
        })
        if (remains <= 0) {
            await getWarn(['warn'], {
                jid: message.jid,
                content: {
                    id: message.reply_message.number
                }
            }, 'delete');
            if (BotAdmin) {
                await message.client.groupParticipantsUpdate(message.from, [message.reply_message.sender], 'remove');
                return await message.reply(lang.WARN.MAX)
            };
        };
    };
})

const { Module, isPublic, config } = require('../lib');


Module({
        pattern: 'getvar ?(.*)',
        fromMe: true,
        desc: 'show all config var',
        type: 'settings'
}, async (message, match) => {
        let msg = "*_all config vars_*\n\n",
                got = false;
        for (const key in config) {
                if (key != 'DATABASE' && key != 'BASE_URL' && key != 'HEROKU' && key != 'SESSION_ID') {
                        if (!match) {
                                msg += `_*${key}* : ${config[key]}_\n`;
                        } else if (match.toUpperCase() == key) {
                                return await message.reply(`_*${match.toUpperCase()}* : ${config[key]}_`);
                                got = true;
                                break;
                        }
                }
        }
        if (match && !got) return await message.reply('_thet requested key not found_\n_try *getvar* to get all variables_');
        return await message.reply(msg);
});

Module({
        pattern: 'whois ?(.*)',
        fromMe: isPublic,
        type: 'info',
        desc: 'get user bio and image'
}, async (message, match) => {
                let user = (message.reply_message.sender || match).replace(/[^0-9]/g, '');
                if (!user) return message.reply('_Need a User!_')
                user += '@s.whatsapp.net';
                try {
                        pp = await message.client.profilePictureUrl(user, 'image')
                } catch {
                        pp = 'https://i.imgur.com/b3hlzl5.jpg'
                }
                let status = await message.client.fetchStatus(user)
                const date = new Date(status.setAt);
                const options = {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                };
                const setAt = date.toLocaleString('en-US', options);
                await message.send({
                        url: pp
                }, {
                        caption: `*Name :* ${await message.getName(user)}\n*About :* ${status.status}\n*About Set Date :* ${setAt}`,
                        quoted: message.data
                }, 'image')
})
                                   

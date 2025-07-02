/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
        Bixby,
        mention,
        GenListMessage,
        config
} = require("../lib");

const { personalDB } = require("../lib/db");


Bixby({
        pattern: 'mention ?(.*)',
        on: 'all',
        allowBot: true,
        fromMe: false,
        type: 'user'
}, async (message, match) => {
        if (message.command && message.isCreator && !message.isBot && message.command.includes('mention') && match.toLowerCase() == 'get') {
                const {mention} = await personalDB(['mention'], {content: {}}, 'get');
                        if(!mention || mention.status == 'false') return await message.send(`_*Example: mention on* to activates mention_`);
                        return await message.send((mention.message|| 'there have no mention messages'));
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match.toLowerCase() == 'off') {
                    	const {mention} = await personalDB(['mention'], {content: {}}, 'get');
                        if(!mention || mention.status == 'false') return await message.send(`_Mention message not set, visit ${config.BASE_URL}/info/mention for help_`);
                        await personalDB(['mention'], {content: {status: 'false', message: mention.message }}, 'set');
                        return await message.send('_mention deactivated_');
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match.toLowerCase() == 'on') {
                    	const {mention} = await personalDB(['mention'], {content: {}}, 'get');
                        if(mention && mention.status == 'true') return await message.send(`_mention already activated_\n_visit ${config.BASE_URL}/info/mention for help_`);
                        await personalDB(['mention'], {content: {status: 'true', message: mention?.message }}, 'set');
                        return await message.send('_mention activated_');
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match != ""){
                	    const {mention} = await personalDB(['mention'], {content: {}}, 'get');
                        const status = mention && mention.status == 'true' ? 'true' : 'false';
                        await personalDB(['mention'], {content: {status, message : match }}, 'set');
                        return await message.send('_mention updated_');
                }
        if (!message.mention.isOwner) return;
        const {mention: msg} = await personalDB(['mention'], {content: {}}, 'get');
        if (!msg || msg.status == 'false' || !msg.message) return;
        return await mention(message, msg.message);
});

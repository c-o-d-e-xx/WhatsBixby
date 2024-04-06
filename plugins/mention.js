const {
        Module,
        mention,
        sendMention,
        GenListMessage,
        config
} = require('../lib');


Module({
        pattern: 'mention ?(.*)',
        on: 'all',
        allowBot: true,
        fromMe: false
}, async (message, match) => {
        if (message.command && message.isCreator && !message.isBot && message.command.includes('mention') && match.toLowerCase() == 'get') {
                const {mention} = await sendMention(['mention'], {content: {}}, 'get');
                        if(!mention || mention.status == 'false') return await message.send(`_*Example: mention on* to activates mention_`);
                        return await message.send((mention.message|| '_There have No Mention Messages_'));
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match.toLowerCase() == 'off') {
                    	const {mention} = await sendMention(['mention'], {content: {}}, 'get');
                        if(!mention || mention.status == 'false') return await message.send(`_Mention message not set_`);
                        await sendMention(['mention'], {content: {status: 'false', message: mention.message }}, 'set');
                        return await message.send('_Mention Deactivated_');
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match.toLowerCase() == 'on') {
                    	const {mention} = await sendMention(['mention'], {content: {}}, 'get');
                        if(mention && mention.status == 'true') return await message.send(`_Mention already activated__`);
                        await sendMention(['mention'], {content: {status: 'true', message: mention?.message }}, 'set');
                        return await message.send('_Mention Activated_');
                } else if (message.isCreator && !message.isBot && message.command && message.command.includes('mention') && match != ""){
                	    const {mention} = await sendMention(['mention'], {content: {}}, 'get');
                        const status = mention && mention.status == 'true' ? 'true' : 'false';
                        await sendMention(['mention'], {content: {status, message : match }}, 'set');
                        return await message.send('_Mention Updated_');
                }
        if (!message.mention.isOwner) return;
        const {mention: msg} = await sendMention(['mention'], {content: {}}, 'get');
        if (!msg || msg.status == 'false' || !msg.message) return;
        return await mention(message, msg.message);
});

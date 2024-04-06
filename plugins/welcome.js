const {
    Module,
    getWelcome,
    config
} = require('../lib')

Module({
    pattern: 'welcome ?(.*)',
    desc: 'set welcome message',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
	const {welcome} = await getWelcome(['welcome'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'false') return await message.reply(`_*Example:* welcome get_\n_welcome hy &mention_`);
        if(!welcome.message) return await message.reply('*Not Found*');
        return await message.send(welcome.message);
    } else if(match.toLowerCase() == 'off'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'false') return await message.reply(`_Welcome already deactivated_`);
        await getWelcome(['welcome'], {jid: message.jid, content: {status: 'false',message: welcome.message }}, 'set');
        return await message.reply('_Welcome Disabled✅_');
    } else if(match.toLowerCase() == 'on'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'true') return await message.reply(`_Welcome already activated_`);
        await getWelcome(['welcome'], {jid: message.jid, content: {status: 'true',message: welcome.message }}, 'set');
        return await message.reply('_Welcome Enabled✅_');
    } else if(match){
        const status = welcome && welcome.status ? welcome. status : 'false';
        await getWelcome(['welcome'], {jid: message.jid, content: {status, message: match}}, 'set');
        return await message.reply('_Welcome set Successfuly_');
    }
    return await message.reply('_*welcome get*_\n_*welcome* thank you for joining &mention_\n*_welcome false_*');
});

Module({
    pattern: 'goodbye ?(.*)',
    desc: 'set goodbye message',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
	const {exit} = await getWelcome(['exit'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'false') return await message.reply(`_*Example:* goodbye get_\n_goodbye hy &mention\n_*for more:* visit ${config.BASE_URL}info/goodbye_`);
        if(!exit.message) return await message.reply('*Not Found*');
        return await message.send(goodbye.message);
    } else if(match.toLowerCase() == 'off'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'false') return await message.reply(`_Goodbye already activated_`);
        await getWelcome(['exit'], {jid: message.jid, content: {status: 'false',message: exit.message }}, 'set');
        return await message.reply('_Goodbye Disabled_');
    } else if(match.toLowerCase() == 'on'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'true') return await message.reply(`_Goodbye already deactivated_`);
        await getWelcome(['exit'], {jid: message.jid, content: {status: 'true',message: exit.message }}, 'set');
        return await message.reply('_Goodbye Enabled_');
    } else if(match){
        const status = exit && exit.status ? exit.status : 'false';
        await getWelcome(['exit'], {jid: message.jid, content: {status, message: match}}, 'set');
        return await message.reply('_Goodbye Set Successfully_');
    }
    return await message.reply('_*goodbye get*_\n_*goodbye* Hy bro &mention_\n*_goodbye false_*');
});
	      
	      

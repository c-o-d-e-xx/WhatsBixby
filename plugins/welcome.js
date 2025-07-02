const { Bixby,config } = require("../lib")
const { groupDB } = require("../lib/db");

Bixby({
    pattern: 'welcome ?(.*)',
    desc: 'set welcome message',
    react: '😅',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
	const {welcome} = await groupDB(['welcome'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'false') return await message.send(`_*Example:* welcome get_\n_welcome hy &mention\n_*for more:* visit ${config.BASE_URL}info/welcome_`);
        if(!welcome.message) return await message.send('*Not Found*');
        return await message.send(welcome.message);
    } else if(match.toLowerCase() == 'off'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'false') return await message.send(`_already deactivated_`);
        await groupDB(['welcome'], {jid: message.jid, content: {status: 'false',message: welcome.message }}, 'set');
        return await message.send('*successfull*');
    } else if(match.toLowerCase() == 'on'){
        const status = welcome && welcome.status ? welcome. status : 'false';
        if(status == 'true') return await message.send(`_already activated_`);
        await groupDB(['welcome'], {jid: message.jid, content: {status: 'true',message: welcome.message }}, 'set');
        return await message.send('*successfull*');
    } else if(match){
        const status = welcome && welcome.status ? welcome. status : 'false';
        await groupDB(['welcome'], {jid: message.jid, content: {status, message: match}}, 'set');
        return await message.send('*success*');
    }
    return await message.send('_*welcome get*_\n_*welcome* thank you for joining &mention_\n*_welcome false_*');
});

Bixby({
    pattern: 'goodbye ?(.*)',
    desc: 'set goodbye message',
    react: '👏',
    type: 'greetings',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
	const {exit} = await groupDB(['exit'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'false') return await message.send(`_*Example:* goodbye get_\n_goodbye hy &mention\n_*for more:* visit ${config.BASE_URL}info/goodbye_`);
        if(!exit.message) return await message.send('*Not Found*');
        return await message.send(goodbye.message);
    } else if(match.toLowerCase() == 'off'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'false') return await message.send(`_already activated_`);
        await groupDB(['exit'], {jid: message.jid, content: {status: 'false',message: exit.message }}, 'set');
        return await message.send('*successfull*');
    } else if(match.toLowerCase() == 'on'){
        const status = exit && exit.status ? exit.status : 'false';
        if(status == 'true') return await message.send(`_already deactivated_`);
        await groupDB(['exit'], {jid: message.jid, content: {status: 'true',message: exit.message }}, 'set');
        return await message.send('*successfull*');
    } else if(match){
        const status = exit && exit.status ? exit.status : 'false';
        await groupDB(['exit'], {jid: message.jid, content: {status, message: match}}, 'set');
        return await message.send('*success*');
    }
    return await message.send('_*goodbye get*_\n_*goodbye* thank you for joining &mention_\n*_goodbye false_*');
});

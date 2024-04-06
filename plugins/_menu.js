const {
    Module,
    commands,
    sendMenu,
    getAlive,
    sendAlive,
    isPublic,
    tiny
} = require('../lib/')

Module({
    pattern: 'ping ?(.*)',
    desc: 'Send Bot Status',
    fromMe: isPublic,
    type: 'info'
}, async (message, match) => {
    var start = new Date().getTime();
    var msg = await message.reply('*Testing Speed..*');
    var end = new Date().getTime();
    await message.reply('⟪ *Response in ' + (end - start) + ' msec* ⟫');
});

Module({
    pattern: "menu",
    desc: 'Send Bot Menu',
    type: 'info',
    fromMe: isPublic
}, async (message, match) => {
    return await sendMenu(message, 'non button');
});

Module({
    pattern: "alive",
    desc: 'Send Bot Alive Message',
    type: 'info',
    fromMe: isPublic
}, async (message, match) => {
    if(match == "get" && message.isCreator){
	    const {alive} = await getAlive(['alive'], {content:{}},'get');
	    return await message.reply(alive);} else if(match && message.isCreator){
	    await getAlive(['alive'], {content: match},'set');
	    return await message.reply('_Alive Message Updated_');
    }
    const {alive} = await getAlive(['alive'], {content:{}},'get');
    return await sendAlive(message, alive);
});


Module({
	pattern: 'list',
	desc: 'Send Bot List',
	type: 'info',
	fromMe: isPublic
}, async (message) => {
	let count = 1,
	list = "";
	commands.map((cmd => {if (cmd.pattern && cmd.desc) {list += `${count++} *${cmd.pattern.replace(/[^a-zA-Z0-9,-]/g,"")}*\n_${cmd.desc}_\n\n`;
		} else {
		list += `${count++} : *${cmd.pattern?cmd.pattern.replace(/[^a-zA-Z0-9,-]/g,""):''}*\n`
		}
	}));
	const listt = await tiny(list)
	return await message.reply(listt);
});


/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    commands,
    send_alive,
    send_menu,
    MODE
} = require("../lib")

const { personalDB } = require("../lib/db");

Bixby({
	pattern: 'list',
	desc: 'list all command with description',
	react: "💯",
	type: 'info',
	fromMe: MODE
}, async (message) => {
	let count = 1,
		list = "";
	commands.map((cmd => {
		if (cmd.pattern && cmd.desc) {
			list += `${count++} *${cmd.pattern.replace(/[^a-zA-Z0-9,-]/g,"")}*\n_${cmd.desc}_\n\n`;
		} else {
			list += `${count++} *${cmd.pattern?cmd.pattern.replace(/[^a-zA-Z0-9,-]/g,""):''}*\n`
		}
	}));
	return await message.send(list);
});

Bixby({
    pattern: 'menu',
    desc: 'list all commands',
    react: "📰",
    type: 'info',
    fromMe: MODE
}, async (message, match) => {
    return await send_menu(message);
});

Bixby({
    pattern: 'alive',
    desc: 'show bot online',
    react: "🥰",
    type: 'info',
    fromMe: MODE
}, async (message, match) => {
    if(match == "get" && message.isCreator){
	    const {alive} = await personalDB(['alive'], {content:{}},'get');
	    return await message.send(alive);
    } else if(match && message.isCreator){
	    await personalDB(['alive'], {content: match},'set');
	    return await message.send('*success*');
    }
    const {alive} = await personalDB(['alive'], {content:{}},'get');
    return await send_alive(message, alive);
});

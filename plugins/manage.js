const {
	Module,
	getVar
} = require('../lib')
const {
	exec
} = require("child_process");

Module({
	pattern: 'shutoff ?(.*)',
	desc: 'turn off the bot',
	type: 'owner',
	root: true
}, async (message, match) => {
	const {
		shutoff
	} = await getVar(['shutoff'], {
		content: {}
	}, 'get');
	if (shutoff && shutoff == 'true') return await message.reply("_already turned off!_");
	await getVar(['shutoff'], {
		content: 'true'
	}, 'set');
	await message.reply('*shutting off!⚫️*');
	return exec('pm2 restart all')
});

Module({
	pattern: 'shuton ?(.*)',
	desc: 'turn on the bot',
	type: 'owner',
	root: true
}, async (message, match) => {
	const {
		shutoff
	} = await getVar(['shutoff'], {
		content: {}
	}, 'get');
	if (shutoff && shutoff == 'false') return await message.reply("_already turned on!_");
	await getVar(['shutoff'], {
		content: 'false'
	}, 'set');
	await message.reply('*shutting on!⚪️*');
	return exec('pm2 restart all')
});

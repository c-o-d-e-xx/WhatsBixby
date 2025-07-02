const { Bixby } = require("../lib");
const { personalDB } = require("../lib/db");

Bixby({
	pattern: 'shutoff ?(.*)',
	desc: 'turn off the bot',
	type: 'owner',
	usage: 'turnoff bot',
	root: true
}, async (message, match) => {
	const {
		shutoff
	} = await personalDB(['shutoff'], {
		content: {}
	}, 'get');
	if (shutoff && shutoff == 'true') return await message.send("_already turned off!_");
	await personalDB(['shutoff'], {
		content: 'true'
	}, 'set');
	await message.send('*shutting off!⚫️*');
	return process.exit(0)
});

Bixby({
	pattern: 'shuton ?(.*)',
	desc: 'turn on the bot',
	type: 'owner',
	usage: 'turnon bot',
	root: true
}, async (message, match) => {
	const {
		shutoff
	} = await personalDB(['shutoff'], {
		content: {}
	}, 'get');
	if (shutoff && shutoff == 'false') return await message.send("_already turned on!_");
	await personalDB(['shutoff'], {
		content: 'false'
	}, 'set');
	await message.send('*shutting on!⚪️*');
	return process.exit(0)
});

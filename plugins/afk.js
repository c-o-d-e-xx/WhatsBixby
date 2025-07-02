/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby } = require("../lib/");

let AFK = {
	isAfk: false,
	reason: false,
	lastseen: 0
};


function secondsToHms(d) {
	d = Number(d);
	let h = Math.floor(d / 3600);
	let m = Math.floor(d % 3600 / 60);
	let s = Math.floor(d % 3600 % 60);
	let hDisplay = h > 0 ? h + (h == 1 ? " HOURS, " : " HOURS, ") : "";
	let mDisplay = m > 0 ? m + (m == 1 ? " MINUTE, " : " MINUTE, ") : "";
	let sDisplay = s > 0 ? s + (s == 1 ? " SECOND, " : " SECOND") : "";
	return hDisplay + mDisplay + sDisplay;
}

Bixby({
	on: 'all',
	fromMe: false
}, async (message, match) => {
	if (!AFK.isAfk ||  message.fromMe)  return;
	if(!message.mention.isBotNumber && !message.reply_message.i && message.isGroup)  return;
		if (message.mention.isBotNumber && message.isGroup) {
					await message.send('```This is a bot. My owner is not here at the moment```\n' +
						(AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
						(AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
							quoted: message.data
						});
		} else if (message.isGroup && message.reply_message.sender == message.user.jid) {
				await message.send('```This is a bot. My owner is not here at the moment```\n' +
					(AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
					(AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
						quoted: message.data
					});

		} else if(!message.isGroup) {
			await message.send('```This is a bot. My owner is not here at the moment```\n' +
				(AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
				(AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
					quoted: message.data
				});
		}
});

Bixby({
	on: 'text',
	fromMe: true
}, async (message, match) => {
	if (!AFK.isAfk)  return;
		AFK.lastseen = 0;
		AFK.reason = false;
		AFK.isAfk = false;
		await message.send('```I am not AFK anymore!```');
});

Bixby({
	pattern: 'afk ?(.*)',
	fromMe: true,
	desc: 'away from keyboard',
	type: 'owner'
}, async (message, match) => {
	if (!AFK.isAfk) {
		AFK.lastseen = Math.round((new Date()).getTime() / 1000);
		if (match !== '') {
			AFK.reason = match;
		}
		AFK.isAfk = true;
		await message.send(AFK.reason ? '*_Im AFK now!_*\n*Reason:* ' + AFK.reason :  '*_Im AFK now!_*');
	}
});

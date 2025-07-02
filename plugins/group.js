/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	isAdmin,
	isBotAdmin,
	linkPreview,
	addSpace,
	config
} = require("../lib");


Bixby({
	pattern: 'promote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'promote group member'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (!message.send_message.sender) return message.send('_please reply to a user_', {
		linkPreview: linkPreview()
	})
	await message.client.groupParticipantsUpdate(message.jid,
		[message.send_message.sender], "promote");
	message.send(`_@${message.send_message.sender.split('@')[0]} promoted as admin successfully_`, {
		mentions: [message.send_message.sender],
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'kick ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "kick group member'"
}, async (message, match) => {
	let admin = await isAdmin(message);
	let user = message.send_message.sender || match;
	if (!user) return await message.send('_please reply to user_', {
		linkPreview: linkPreview()
	})
	user = user.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
	if (match != "all") {
		if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
			linkPreview: linkPreview()
		})
		await message.client.groupParticipantsUpdate(message.jid,
			[user], "remove");
		return await message.send(`_@${user.split('@')[0]} kick from group_`, {
			mentions: [user],
			linkPreview: linkPreview()
		});
	} else if (match.toLowerCase() == 'all') {
		if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
			linkPreview: linkPreview()
		})
		const groupMetadata = await message.client.groupMetadata(message.jid).catch(e => {})
		const participants = await groupMetadata.participants;
		let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
		participants.filter((U) => !U.admin == true).map(({
			id
		}) => id).forEach(async (k) => {
			await sleep(2500);
			await message.client.groupParticipantsUpdate(message.jid,
				[k], "remove");
		});
		return await message.send('all group Participants will been kicked!')
	}
});

Bixby({
	pattern: 'demote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "demote group member"
}, async (message, match) => {
	let admin = await isAdmin(message);
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (!message.send_message.sender) return message.send('_please reply to a user_', {
		linkPreview: linkPreview()
	});
	await message.client.groupParticipantsUpdate(message.jid,
		[message.send_message.sender], "demote");
	return await message.send(`_@${message.send_message.sender.split('@')[0]} demoted from admin successfully_`, {
		mentions: [message.send_message.sender],
		linkPreview: linkPreview()
	})
});


Bixby({
	pattern: 'revoke ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'revoke group link'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	await message.client.groupRevokeInvite(message.jid);
	return await message.send('_successfully revoked group link_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'invite ?(.*)',
	type: 'group',
	onlyGroup: true,
	fromMe: true,
	desc: 'get group link'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	const code = await message.client.groupInviteCode(message.jid);
	return await message.send(`https://chat.whatsapp.com/${code}`, {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'lock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'change group privacy to only admins edit'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	await message.client.groupSettingUpdate(message.jid, 'locked');
	return await message.send('_successfully changed group settings_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'mute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'mute group'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	await message.client.groupSettingUpdate(message.jid, 'announcement');
	return await message.send('_group muted_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'unmute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'unmute a group'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	await message.client.groupSettingUpdate(message.jid, 'not_announcement');
	return await message.send('_group unmuted_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'gdesc ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'update group description'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (message.text > 400) return await message.send('_can`t be updated_', {
		linkPreview: linkPreview()
	})
	let txt = match || ' ';
	await message.client.groupUpdateDescription(message.jid, txt);
	return await message.send('_updated successfully_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'unlock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'chamge group privacy to members can edit'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	await message.client.groupSettingUpdate(message.jid, 'unlocked');
	return await message.send('_successfully changed group settings_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'left ?(.*)',
	type: 'group',
	onlyGroup: true,
	desc: 'left from group',
	fromMe: true
}, async (message, match) => {
	await message.client.groupLeave(message.jid)
});

Bixby({
	pattern: 'gname ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'update group name'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (message.text > 75) return await message.send('_can`t be updated_', {
		linkPreview: linkPreview()
	})
	let txt = message.text || ' ';
	await message.client.groupUpdateSubject(message.jid, txt);
	return await message.send('_group name updated_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'gpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'update group icon'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (!message.reply_message.image) return await message.send('__please reply to a image message_');
	let download = await message.client.downloadMediaMessage(message.reply_message.imageMessage);
	await message.client.updateProfilePicture(message.jid, download);
	return message.send('_Group profile updated_', {
		linkPreview: linkPreview()
	})
})

Bixby({
	pattern: 'fullgpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'update group icon'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (!message.reply_message.image) return await message.send('_please reply to a image message_');
	await message.updateProfilePicture(message.jid, await message.reply_message.download());
	return message.send('_profile photo updated_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'join ?(.*)',
	type: 'owner',
	fromMe: true,
	desc: 'join a group using group link'
}, async (message, match) => {
	if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/)) return await message.send('_invalid url_', {
		linkPreview: linkPreview()
	});
	let urlArray = (match).trim().split('/');
	if (!urlArray[2] == 'chat.whatsapp.com') return await message.send('_url must be a whatsapp group link_', {
		linkPreview: linkPreview()
	})
	const response = await message.client.groupAcceptInvite(urlArray[3]);
	return await message.send('_successfully joind_', {
		linkPreview: linkPreview()
	})
});

Bixby({
	pattern: 'add ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "add member's to group"
}, async (message, match) => {
	match = message.send_message.sender || match;
	if (!match) return await message.send('_please reply to a user_');
	match = match.replaceAll(' ', '');
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	if (match) {
		let users = match.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let info = await message.client.onWhatsApp(users);
		ex = info.map((jid) => jid.jid);
		if (!ex.includes(users)) return await message.send('user not in whatsapp');
		const su = await message.client.groupParticipantsUpdate(message.jid,
			[users], "add");
		if (su[0].status == 403) {
			await message.send('_Couldn\'t add. Invite sent!_');
			return await message.sendGroupInviteMessage(users);
		} else if (su[0].status == 408) {
			await message.send("Couldn\'t add because they left the group recently. Try again later.", {
				linkPreview: linkPreview()
			})
			const code = await message.client.groupInviteCode(message.jid);
			return await message.client.sendMessage(users, {
				text: `https://chat.whatsapp.com/${code}`
			})
		} else if (su[0].status == 401) {
			await message.send('Couldn\'t add because they blocked the bot number.', {
				linkPreview: linkPreview()
			})
		} else if (su[0].status == 200) {
			return await message.send(`@${users.split('@')[0]} Added to the group.`, {
				mentions: [users],
				linkPreview: linkPreview()
			})
		} else if (su[0].status == 409) {
			return await message.send("Already in the group.", {
				mentions: [users],
				linkPreview: linkPreview()
			})
		} else {
			return await message.send(su);
		}
	}
});

Bixby({
	pattern: 'ginfo ?(.*)',
	fromMe: true,
	desc: 'Shows group invite info',
	type: 'group'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.reply('*Need Group Link*\n_Example : ginfo group link_')
	const [link, invite] = match.match(/chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i) || []
	if (!invite) return await message.reply('*Invalid invite link*')
	try {
		const response = await message.client.groupGetInviteInfo(invite)
		await message.send("id: " + response.id + "\nsubject: " + response.subject + "\nowner: " + `${response.owner ? response.owner.split('@')[0] : 'unknown'}` + "\nsize: " + response.size + "\nrestrict: " + response.restrict + "\nannounce: " + response.announce + "\ncreation: " + require('moment-timezone')(response.creation * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss') + "\ndesc" + response.desc)
	} catch (error) {
		await message.reply('*Invalid invite link*')
	}
});

Bixby({
	pattern: 'tag ?(.*)',
	desc: 'tag all members',
	type: "owner",
	onlyGroup: true,
	fromMe: true
}, async (message, match) => {
	if (!match && !message.reply_message.msg) return;
	const groupMetadata = await message.client.groupMetadata(message.from).catch(e => {})
	const participants = await groupMetadata.participants
	let admins = await participants.filter(v => v.admin !== null).map(v => v.id)
	if (match == "all") {
		let msg = "",
			ext;
		let count = 1;
		for (let mem of participants) {
			msg += `${addSpace(count++, 3)} @${mem.id.split('@')[0]}\n`
		}
		return await message.send('```' + msg + '```', {
			mentions: participants.map(a => a.id)
		});
	} else if (match == "admin" || match == "admins") {
		let msg = "";
		let count = 1;
		for (let mem of admins) {
			msg += `${addSpace(count++, 3)} @${mem.split('@')[0]}\n`
		}
		return await await message.send('```' + msg + '```', {
			mentions: participants.map(a => a.id)
		});
	} else if (match == "me" || match == "mee") {
		return await message.send(`@${message.user.number}`, {
			mentions: [message.user.jid]
		});
	} else if (match || message.reply_message.text) {
		match = message.reply_message.text || match;
		if (!match) return await message.reply('_give me some query_');
		await message.send(match, {
			mentions: participants.map((a) => a.id)
		});
	} else if (message.reply_message.i) {
		return await message.forwardMessage(message.jid, message.reply_message, {
			contextInfo: {
				mentionedJid: participants.map(a => a.id)
			}
		});
	}
});

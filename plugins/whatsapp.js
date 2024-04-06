const {
	Module,
	isPublic,
	getCompo,
	sleep,
	lang,
	config
} = require('../lib');
const {
	WA_DEFAULT_EPHEMERAL
} = require("@whiskeysockets/baileys");

Module({
	pattern: 'del',
	desc: lang.WHATSAPP.DLT_DESC,
	type: 'whatsapp',
	fromMe: true,
	onlyGroup: true
}, async (message, match) => {
	if (!message.reply_message.text) return;
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
});
Module({
	pattern: 'dlt',
	desc: lang.WHATSAPP.DEL_DESC,
	fromMe: isPublic,
	type: 'whatsapp',
	onlyGroup: true
}, async (message, match) => {
	if (match) return;
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN);
	if (config.ADMIN_SUDO_ACCESS != "true" && !message.isCreator) return await message.reply(lang.BASE.NOT_AUTHR)
	if (!admin && !message.isCreator) return await message.reply(lang.BASE.NOT_AUTHR)
	if (!message.reply_message.msg) return message.reply(lang.BASE.NEED.format("message"));
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
})

Module({
	pattern: '$iswa ?(.*)',
	fromMe: isPublic,
	desc: lang.WHATSAPP.ISWA.ISWA_DISC,
	type: 'search',
}, async (m, match) => {
	match = match || m.reply_message.text
	if (!match) return await m.send(lang.WHATSAPP.ISWA.NO_NUMBER.format(".iswa 920000000x"));
	if (!match.match('x')) return await m.send(lang.WHATSAPP.ISWA.NOT_VALID.format(".iswa 920000000x"));
	let xlength = match.replace(/[0-9]/gi, '')
	if (xlength.length > 3) return await m.send(lang.WHATSAPP.ISWA.X_LENGTH)
	let count = xlength.length == 3 ? 1000 : xlength.length == 2 ? 100 : 10;
	const {
		key
	} = await m.send(lang.WHATSAPP.ISWA.WAIT);
	let ioo = await getCompo(match)
	let bcs = [],
		notFound = []
	ioo.map(async (a) => {
		let [rr] = await m.client.onWhatsApp(a)
		if (rr && rr.exists) {
			bcs.push(rr.jid);
		}
	});
	let msg = "",
		prvt = [],
		abt, n = 1;
	await sleep(2500);
	msg += lang.WHATSAPP.ISWA.EXIST.format(bcs.length, count)
	bcs.map(async (jid) => {
		abt = await m.client.fetchStatus(jid).catch((e) => {
			notFound.push(jid);
		});
		if (!abt.status) {
			prvt.push(jid)
		} else {
			msg += `${n++}. *Number :* ${jid.replace(/[^0-9]/gi,'')}\n*About :* ${abt.status}\n*Date :* ${abt.setAt.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})}\n\n`
		}
	})
	await sleep(1750)
	if (prvt.length) {
		msg += lang.WHATSAPP.ISWA.PRIVACY.format(prvt.length, bcs.length)
		prvt.map((num) => {
			msg += `*Number:* ${num.replace(/[^0-9]/gi,'')}\n`
		});
	}
	await sleep(750)
	if (notFound.length) {
		msg += lang.WHATSAPP.ISWA.NOT_FOUND.format(bcs.length - n - prvt.length, bcs.length)
		notFound.map((j) => {
			msg += `*Number:* ${j.replace(/[^0-9]/gi,'')}\n`
		})
	}
	await sleep(50)
	return await m.editMessage(m.jid, msg, key)
});


Module({
	pattern: '$nowa ?(.*)',
	fromMe: isPublic,
	desc: lang.WHATSAPP.NOWA.DESC,
	type: 'search',
}, async (m, match) => {
	match = match || m.reply_message.text
	if (!match) return await m.send(lang.WHATSAPP.NOWA.NO_NUMBER.format(".nowa 920000000x"));
	if (!match.match('x')) return await m.send(lang.WHATSAPP.NOWA.NOT_VALID.format(".nowa 920000000x"));
	let xlength = match.replace(/[0-9]/gi, '')
	if (xlength.length > 3) return await m.send(lang.WHATSAPP.NOWA.X_LENGTH)
	let count = xlength.length == 3 ? 1000 : xlength.length == 2 ? 100 : 10;
	const {
		key
	} = await m.send(lang.WHATSAPP.NOWA.WAIT);
	let ioo = await getCompo(match)
	let bcs = lang.WHATSAPP.NOWA.LIST,
		n = 1;
	ioo.map(async (a) => {
		let [rr] = await m.client.onWhatsApp(a).catch((e) => console.log(e))
		if (!rr) bcs += "```wa.me/" + a + "```\n";
	});
	await sleep(2000)
	bcs = bcs.replace("{}", (bcs.split('\n').length - 3).toString());
	await sleep(100);
	return await m.editMessage(m.jid, bcs, key)
});

Module({
	pattern: 'jid',
	fromMe: isPublic,
	desc: lang.USER.JID,
	type: "user"
}, async (message) => {
	if (message.reply_message.sender) {
		await message.reply(message.reply_message.sender)
	} else {
		await message.reply(message.from)
	}
});
Module({
	pattern: 'block',
	desc: lang.USER.BLOCK_DESC,
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "block") // Block user
	} else {
		await message.client.updateBlockStatus(message.from, "block")
	}
}); // Block user
Module({
	pattern: 'unblock',
	desc: lang.USER.UNBLOCK_DESC,
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "unblock") // Unblock user
	} else {
		await message.client.updateBlockStatus(message.from, "unblock") // Unblock user
	}
});
Module({
	pattern: "pp",
	desc: lang.USER.PP.DESC,
	type: 'owner',
	fromMe: true
}, async (message, match) => {
	if (!message.reply_message.image) return await message.reply(lang.BASE.NEED.format("image message"));
	let download = await message.client.downloadMediaMessage(message.reply_message.image);
	await message.client.updateProfilePicture(message.botNumber, download);
	return message.reply(lang.USER.PP.SUCCESS);
});
Module({
	pattern: "fullpp",
	desc: lang.USER.FULL_PP.DESC,
	type: 'owner',
	fromMe: true
}, async (message, match) => {
	if (!message.reply_message.image) return await message.reply(lang.BASE.NEED.format("image message"));
	let download = await message.reply_message.download();
	await message.updateProfilePicture(message.botNumber, download);
	return message.reply(lang.USER.FULL_PP.SUCCESS);
});

Module({
	pattern: 'clear ?(.*)',
	fromMe: true,
	desc: 'delete whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		delete: true,
		lastMessages: [{
			key: message.data.key,
			messageTimestamp: message.messageTimestamp
		}]
	}, message.jid)
	await message.reply('_Cleared_')
})

Module({
	pattern: 'archive ?(.*)',
	fromMe: true,
	desc: 'archive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: true,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.reply('_Archived_')
})

Module({
	pattern: 'unarchive ?(.*)',
	fromMe: true,
	desc: 'unarchive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: false,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.reply('_Unarchived_')
})

Module({
	pattern: 'chatpin ?(.*)',
	fromMe: true,
	desc: 'pin a chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: true
	}, message.jid);
	await message.reply('_Pined_')
})

Module({
	pattern: 'unpin ?(.*)',
	fromMe: true,
	desc: 'unpin a msg',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: false
	}, message.jid);
	await message.reply('_Unpined_')
})

Module({
	pattern: 'setbio ?(.*)',
	fromMe: true,
	desc: 'To change your profile status',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.reply('*Need Status!*\n*Example: setbio Hey there! I am using WhatsApp*.')
	await message.client.updateProfileStatus(match)
	await message.reply('_Profile status updated_')
})

Module({
	pattern: 'setname ?(.*)',
	fromMe: true,
	desc: 'To change your profile name',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.reply('*Need Name!*\n*Example: setname your name*.')
	await message.client.updateProfileName(match)
	await message.reply('_Profile name updated_')
})

Module({
	pattern: 'disappear  ?(.*)',
	fromMe: true,
	desc: 'turn on default disappear messages',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.sendMessage(
		message.jid, {
			disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL
		}
	)
	await message.reply('_disappearmessage activated_')
})

Module({
	pattern: 'getprivacy ?(.*)',
	fromMe: true,
	desc: 'get your privacy settings',
	type: 'privacy'
}, async (message, match) => {
	const {
		readreceipts,
		profile,
		status,
		online,
		last,
		groupadd,
		calladd
	} = await message.client.fetchPrivacySettings(true);
	const msg = `*♺ my privacy*

*ᝄ name :* ${message.client.user.name}
*ᝄ online:* ${online}
*ᝄ profile :* ${profile}
*ᝄ last seen :* ${last}
*ᝄ read receipt :* ${readreceipts}
*ᝄ about seted time :*
*ᝄ group add settings :* ${groupadd}
*ᝄ call add settings :* ${calladd}`;
	let img;
	try {
		img = {
			url: await message.client.profilePictureUrl(message.user.jid, 'image')
		};
	} catch (e) {
		img = {
			url: "https://i.ibb.co/sFjZh7S/6883ac4d6a92.jpg"
		};
	}
	await message.send(img, {
		caption: msg,
		quoted: message
	}, 'image');
})
Module({
	pattern: 'lastseen ?(.*)',
	fromMe: true,
	desc: 'to change lastseen privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change last seen privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateLastSeenPrivacy(match)
	await message.reply(`_Privacy settings *last seen* Updated to *${match}*_`);
})
Module({
	pattern: 'online ?(.*)',
	fromMe: true,
	desc: 'to change online privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change *online*  privacy settings_`);
	const available_privacy = ['all', 'match_last_seen'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateOnlinePrivacy(match)
	await message.reply(`_Privacy Updated to *${match}*_`);
})
Module({
	pattern: 'mypp ?(.*)',
	fromMe: true,
	desc: 'privacy setting profile picture',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change *profile picture*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateProfilePicturePrivacy(match)
	await message.reply(`_Privacy Updated to *${match}*_`);
})
Module({
	pattern: 'mystatus ?(.*)',
	fromMe: true,
	desc: 'privacy for my status',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change *status*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateStatusPrivacy(match)
	await message.reply(`_Privacy Updated to *${match}*_`);
})
Module({
	pattern: 'read ?(.*)',
	fromMe: true,
	desc: 'privacy for read message',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change *read and receipts message*  privacy settings_`);
	const available_privacy = ['all', 'none'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateReadReceiptsPrivacy(match)
	await message.reply(`_Privacy Updated to *${match}*_`);
})
Module({
	pattern: 'groupadd ?(.*)',
	fromMe: true,
	desc: 'privacy for group add',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.reply(`_*Example:-* ${cmd} all_\n_to change *group add*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.reply(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateGroupsAddPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})



Module({
        pattern: 'whois ?(.*)',
        fromMe: isPublic,
        type: 'info',
        desc: 'get user bio and image'
}, async (message, match) => {
                let user = (message.reply_message.sender || match).replace(/[^0-9]/g, '');
                if (!user) return message.reply('_Need a User!_')
                user += '@s.whatsapp.net';
                try {
                        pp = await message.client.profilePictureUrl(user, 'image')
                } catch {
                        pp = 'https://i.imgur.com/b3hlzl5.jpg'
                }
                let status = await message.client.fetchStatus(user)
                const date = new Date(status.setAt);
                const options = {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                };
                const setAt = date.toLocaleString('en-US', options);
                await message.send({
                        url: pp
                }, {
                        caption: `*Name :* ${await message.getName(user)}\n*About :* ${status.status}\n*About Set Date :* ${setAt}`,
                        quoted: message.data
                }, 'image')
})

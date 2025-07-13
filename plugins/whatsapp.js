const {
	Bixby,
	MODE,
	getCompo,
	sleep,
	config,
	getString,
	isAdmin,
	isBotAdmin
} = require('../lib');
const {
	WA_DEFAULT_EPHEMERAL
} = require("@c-o-d-e-xx/baileys-revamped");

Bixby({
        pattern: 'whois ?(.*)',
        fromMe: MODE,
        type: 'info',
        desc: 'get user bio and image'
}, async (message, match) => {
                let user = (message.reply_message.sender || match).replace(/[^0-9]/g, '');
                if (!user) return message.send('_Need a User!_')
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

Bixby({
	pattern: 'del',
	desc: 'deleted a message thet send by bot',
	react: "⚒️",
	type: 'whatsapp',
	fromMe: true,
	onlyGroup: true
}, async (message, match) => {
	if (!message.reply_message.text) return;
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
});

Bixby({
	pattern: 'dlt',
	desc: 'delete messages using bot',
	react: "🤌",
	fromMe: MODE,
	type: 'whatsapp',
	onlyGroup: true
}, async (message, match) => {
	if (match) return;
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.reply('bot is nog admin');
	if (!message.reply_message.msg) return message.send(getString.BASE.NEED.format("message"));
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
})

Bixby({
	pattern: '$iswa ?(.*)',
	fromMe: MODE,
	desc: 'list users who exist on whatsapp',
	type: 'search',
}, async (m, match) => {
	match = match || m.reply_message.text
	if (!match) return await m.send(".iswa 920000000x");
	if (!match.match('x')) return await m.send(".iswa 920000000x");
	let xlength = match.replace(/[0-9]/gi, '')
	if (xlength.length > 3) return await m.send('x limit reached')
	let count = xlength.length == 3 ? 1000 : xlength.length == 2 ? 100 : 10;
	const {
		key
	} = await m.send('please White');
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
	msg += getString.WHATSAPP.ISWA.EXIST.format(bcs.length, count)
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
		msg += getString.WHATSAPP.ISWA.PRIVACY.format(prvt.length, bcs.length)
		prvt.map((num) => {
			msg += `*Number:* ${num.replace(/[^0-9]/gi,'')}\n`
		});
	}
	await sleep(750)
	if (notFound.length) {
		msg += getString.WHATSAPP.ISWA.NOT_FOUND.format(bcs.length - n - prvt.length, bcs.length)
		notFound.map((j) => {
			msg += `*Number:* ${j.replace(/[^0-9]/gi,'')}\n`
		})
	}
	await sleep(50)
	return await m.editMessage(m.jid, msg, key)
});

Bixby({
	pattern: '$nowa ?(.*)',
	fromMe: MODE,
	desc: 'list numbers thet not exist on whatsapp',
	type: 'search',
}, async (m, match) => {
	match = match || m.reply_message.text
	if (!match) return await m.send(getString.WHATSAPP.NOWA.NO_NUMBER.format(".nowa 920000000x"));
	if (!match.match('x')) return await m.send(getString.WHATSAPP.NOWA.NOT_VALID.format(".nowa 920000000x"));
	let xlength = match.replace(/[0-9]/gi, '')
	if (xlength.length > 3) return await m.send(getString.WHATSAPP.NOWA.X_LENGTH)
	let count = xlength.length == 3 ? 1000 : xlength.length == 2 ? 100 : 10;
	const {
		key
	} = await m.send(getString.WHATSAPP.NOWA.WAIT);
	let ioo = await getCompo(match)
	let bcs = getString.WHATSAPP.NOWA.LIST,
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

Bixby({
	pattern: 'jid',
	fromMe: MODE,
	desc: 'get jid',
	react: "💯",
	type: "general"
}, async (message) => {
	if (message.reply_message.sender) {
		await message.send(message.reply_message.sender)
	} else {
		await message.send(message.from)
	}
});

Bixby({
	pattern: 'block',
	desc: 'block a user',
	react: "💯",
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "block") // Block user
	} else {
		await message.client.updateBlockStatus(message.from, "block")
	}
}); // Block user

Bixby({
	pattern: 'unblock',
	desc: 'unblock a person',
	react: "💯",
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "unblock") // Unblock user
	} else {
		await message.client.updateBlockStatus(message.from, "unblock") // Unblock user
	}
});

Bixby({
	pattern: "pp",
	desc: 'change profile picture',
	react: "😁",
	type: 'owner',
	fromMe: true
}, async (message, match) => {
	if (!message.reply_message.image) return await message.reply(getString("BASE.NEED").format("image message"));
	let download = await message.client.downloadMediaMessage(message.reply_message.image);
	await message.client.updateProfilePicture(message.botNumber, download);
	return message.reply(getString("USER.PP.SUCCESS"));
});

Bixby({
    pattern: "fullpp",
    desc: 'set profile picture',
    react: "🔥",
    type: 'owner',
    fromMe: true
}, async (message, match) => {
    if (!message.reply_message.image) 
        return await message.reply(getString("BASE.NEED").format("image message"));
    let download = await message.reply_message.download();
    await message.updateProfilePicture(message.botNumber, download);
    return message.reply(getString("USER.FULL_PP.SUCCESS"));
});

Bixby({
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
	await message.send('_Cleared_')
})

Bixby({
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
	await message.send('_Archived_')
})

Bixby({
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
	await message.send('_Unarchived_')
})

Bixby({
	pattern: 'chatpin ?(.*)',
	fromMe: true,
	desc: 'pin a chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: true
	}, message.jid);
	await message.send('_Pined_')
})

Bixby({
	pattern: 'unpin ?(.*)',
	fromMe: true,
	desc: 'unpin a msg',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: false
	}, message.jid);
	await message.send('_Unpined_')
})

Bixby({
	pattern: 'setbio ?(.*)',
	fromMe: true,
	desc: 'To change your profile status',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.send('*Need Status!*\n*Example: setbio Hey there! I am using WhatsApp*.')
	await message.client.updateProfileStatus(match)
	await message.send('_Profile status updated_')
})

Bixby({
	pattern: 'setname ?(.*)',
	fromMe: true,
	desc: 'To change your profile name',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.send('*Need Name!*\n*Example: setname your name*.')
	await message.client.updateProfileName(match)
	await message.send('_Profile name updated_')
})

Bixby({
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
	await message.send('_disappearmessage activated_')
})

Bixby({
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
		caption: msg
	}, 'image');
})

Bixby({
	pattern: 'lastseen ?(.*)',
	fromMe: true,
	desc: 'to change lastseen privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change last seen privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateLastSeenPrivacy(match)
	await message.send(`_Privacy settings *last seen* Updated to *${match}*_`);
})

Bixby({
	pattern: 'online ?(.*)',
	fromMe: true,
	desc: 'to change online privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *online*  privacy settings_`);
	const available_privacy = ['all', 'match_last_seen'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateOnlinePrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})

Bixby({
	pattern: 'mypp ?(.*)',
	fromMe: true,
	desc: 'privacy setting profile picture',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *profile picture*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateProfilePicturePrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})

Bixby({
	pattern: 'mystatus ?(.*)',
	fromMe: true,
	desc: 'privacy for my status',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *status*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateStatusPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})

Bixby({
	pattern: 'read ?(.*)',
	fromMe: true,
	desc: 'privacy for read message',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *read and receipts message*  privacy settings_`);
	const available_privacy = ['all', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateReadReceiptsPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})

Bixby({
	pattern: 'groupadd ?(.*)',
	fromMe: true,
	desc: 'privacy for group add',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *group add*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateGroupsAddPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})

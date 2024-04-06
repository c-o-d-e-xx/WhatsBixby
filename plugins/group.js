const {
	Module,
	isAdmin,
	isBotAdmin,
	getString,
	infoMessage,
	lang,
	getVar,
	broadcast,
	config,
	poll,
	PREFIX
} = require('../lib');

const actions = ['kick','warn','null']

Module({
	pattern: 'promote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.PROMOTE.DESC
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.sender) return message.reply(lang.BASE.NEED.format("user"));
	await message.client.groupParticipantsUpdate(message.jid,
		[message.reply_message.sender], "promote");
	message.send(lang.GROUP.PROMOTE.INFO.format(`@${message.reply_message.sender.split('@')[0]}`), {
		mentions: [message.reply_message.sender]
	})
});
Module({
	pattern: 'demote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.DEMOTE.DESC
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.sender) return message.reply(lang.BASE.NEED.format("user"));
	await message.client.groupParticipantsUpdate(message.jid,
		[message.reply_message.sender], "demote");
	return await message.send(lang.GROUP.DEMOTE.INFO.format(`@${message.reply_message.sender.split('@')[0]}`), {
		mentions: [message.reply_message.sender]
	})
});
Module({
	pattern: 'kick ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.KICK.DESC
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	let user = message.reply_message.sender || match;
	if (!user) return await message.reply(lang.GROUP.KICK.HELP)
	user = user.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
	if (match != "all") {
		if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
		if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
		if (!admin && !message.isCreator) return;
		await message.client.groupParticipantsUpdate(message.jid,
			[user], "remove");
		return await message.send(lang.GROUP.KICK.INFO.format(`@${user.split('@')[0]}`), {
			mentions: [user]
		});
	} else if (match.toLowerCase() == 'all') {
		if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
		if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
		if (!admin && !message.isCreator) return;
		const groupMetadata = await message.client.groupMetadata(message.jid).catch(e => {})
		const participants = await groupMetadata.participants;
		let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
		participants.filter((U) => !U.admin == true).map(({
			id
		}) => id).forEach(async (k) => {
			await sleep(250);
			await message.client.groupParticipantsUpdate(message.jid,
				[k], "remove");
		});
		return await message.reply('_All group Participants will been kicked!_')
	}
});
Module({
	pattern: 'add ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.ADD.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	match = message.reply_message.sender || match;
	if (!match) return await message.reply(lang.BASE.NEED.format("user"));
	match = match.replaceAll(' ', '');
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (match) {
		let users = match.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let info = await message.client.onWhatsApp(users);
		ex = info.map((jid) => jid.jid);
		if (!ex.includes(users)) return await message.reply(lang.GROUP.ADD.NOT_FOUND);
		const su = await message.client.groupParticipantsUpdate(message.jid,
			[users], "add");
		if (su[0].status == 403) {
			message.reply(lang.GROUP.ADD.INVITE);
			return await message.sendGroupInviteMessage(users);
		} else if (su[0].status == 408) {
			await message.send(lang.GROUP.ADD.LEFTED.format("@" + users.split('@')[0]), {
				mentions: [users]
			})
			const code = await message.client.groupInviteCode(message.jid);
			return await message.client.sendMessage(users, {text: `https://chat.whatsapp.com/${code}`})
		} else if (su[0].status == 401) {
			await message.send(lang.GROUP.ADD.BLOCKED.format("@" + users.split('@')[0]), {
				mentions: [users]
			})
		} else if (su[0].status == 200) {
			return await message.send(lang.GROUP.ADD.ADDED.format("@" + users.split('@')[0]), {
				mentions: [users]
			})
		} else if (su[0].status == 409) {
			return await message.send(lang.GROUP.ADD.ALLREADY.format("@" + users.split('@')[0]), {
				mentions: [users]
			})
		} else {
			return await message.send(JSON.stringify(su));
		}
	}
});
Module({
	pattern: 'gpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.GPP.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.image) return await message.reply(lang.BASE.NEED.format("image message"));
	let _message = message.reply_message.imageMessage;
	let download = await message.client.downloadMediaMessage(_message);
	await message.client.updateProfilePicture(message.jid, download);
	return message.reply(lang.GROUP.GPP.INFO);
})
Module({
	pattern: 'fullgpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.FULL_GPP.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.image) return await message.reply(lang.BASE.NEED.format("image message"));
	let download = await message.reply_message.download();
	await message.updateProfilePicture(message.jid, download);
	return message.reply('_Group Icon Updated!_');
});
Module({
	pattern: 'gname ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.G_NAME.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (message.text > 75) return await message.reply(lang.GROUP.G_NAME.LENGTH_OVER)
	let txt = message.text || " ";
	await message.client.groupUpdateSubject(message.jid, txt);
	return await message.reply(lang.GROUP.G_NAME.SUCCESS)
});
Module({
	pattern: 'gdesc ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.G_DESC.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (message.text > 400) return await message.reply(lang.GROUP.G_DESC.LENGTH_OVER)
	let txt = match || " ";
	await message.client.groupUpdateDescription(message.jid, txt);
	return await message.reply(lang.GROUP.G_DESC.SUCCESS)
});
Module({
	pattern: 'mute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.MUTE.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "announcement");
	return await message.reply(lang.GROUP.MUTE.SUCCESS)
});
Module({
	pattern: 'unmute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.UNMUTE.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "not_announcement");
	return await message.reply(lang.GROUP.UNMUTE.SUCCESS)
});
Module({
	pattern: 'lock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.LOCK.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "locked");
	return await message.reply('_Group Settings Locked_')
});
Module({
	pattern: 'unlock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.UNLOCK.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "unlocked");
	return await message.reply('_Group Settings Unlocked_')
});
Module({
	pattern: 'left ?(.*)',
	type: 'group',
	onlyGroup: true,
	desc: lang.GROUP.LEFT.DESC,
	fromMe: true
}, async (message, match) => {
	await message.client.groupLeave(message.jid)
});
Module({
	pattern: 'invite ?(.*)',
	type: 'group',
	onlyGroup: true,
	fromMe: true,
	desc: lang.GROUP.INVITE.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	const code = await message.client.groupInviteCode(message.jid);
	return await message.reply(lang.GROUP.INVITE.INFO.format(`https://chat.whatsapp.com/${code}`))
});
Module({
	pattern: 'revoke ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: lang.GROUP.REVOKE.DESC
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupRevokeInvite(message.jid);
	return await message.reply('_Group link revoked._')
});
Module({
	pattern: 'join ?(.*)',
	type: 'owner',
	fromMe: true,
	fromMe: true,
	desc: lang.GROUP.ACPT.DESC
}, async (message, match) => {
	if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/)) return await message.reply(lang.GROUP.ACPT.NOT_VALID);
	let urlArray = (match).trim().split("/");
	if (!urlArray[2] == 'chat.whatsapp.com') return await message.reply(lang.BASE.INVALID_URL)
	const response = await message.client.groupAcceptInvite(urlArray[3]);
	return await message.reply('_Group Joined Successfully_')
});
Module({
	pattern: 'getinfo ?(.*)',
	type: 'group',
	fromMe: true,
	desc: lang.GROUP.GET_INFO.DESC
}, async (message, match) => {
	match = match || message.reply_message.text;
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.reply(lang.GROUP.BOT_ADMIN)
	if (!config.ADMIN_SUDO_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/)) return await message.reply(lang.GROUP.GET_INFO.GIVE_URL);
	let urlArray = (match).trim().split("/")[3];
	const response = await message.client.groupGetInviteInfo(urlArray)
	return await message.reply("id: " + response.id + lang.GROUP.GET_INFO.INFO.format(response.subject, (response.owner ? response.owner.split('@')[0] : 'unknown'), response.size, response.restrict, response.announce, require('moment-timezone')(response.creation * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss'), response.desc))
});


Module({
	pattern: 'vote|poll ?(.*)',
	desc: 'create a poll message',
	fromMe: true,
	type: "misc",
	onlyGroup: true
}, async (message, match) => {
	if (message.reply_message.i && message.reply_message.type == "pollCreationMessage") {
		const {
			status,
			res,
			total
		} = await poll(message.reply_message.data);
		if (!status) return await message.reply('*Not Found*');
		let msg = "*result*\n\n";
		const obj = Object.keys(res);
		msg += `*total options: ${obj.length}*\n`;
		msg += `*total participates: ${total}*\n\n`;
		obj.map(a => msg += `*${a} :-*\n*_total votes: ${res[a].count}_*\n*_percentage: ${res[a].percentage}_*\n\n`);
		return await message.send(msg);
	}
	match = message.body.replace(/poll/gi, '').replace(/vote/gi, '').replace(PREFIX, '').trim();
	if (!match || !match.split(/[,|;]/)) return await message.reply(`_*Example:* ${PREFIX}poll title |option1|option2|option3..._\n_*get a poll result:* ${PREFIX}poll_\n_reply to a poll message to get its result_`);
	const options = match.split(/[,|;]/).slice(1);
	const {
		participants
	} = await message.client.groupMetadata(message.jid);
	return await message.send({
		name: match.split(/[,|;]/)[0],
		values: options,
		withPrefix: false,
		onlyOnce: true,
		participates: participants.map(a => a.id),
		selectableCount: true
	}, {}, 'poll');
});


Module({
    pattern: 'pdm ?(.*)',
    desc: 'promote, demote message',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('_Pdm Message\non/off');
    if (match != 'on' && match != 'off') return message.reply('pdm on');
    const {pdm} = await getVar(['pdm'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (pdm == 'true') return message.reply('_Pdm Already activated_');
        await getVar(['pdm'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_Pdm Message Activated_')
    } else if (match == 'off') {
        if (pdm == 'false') return message.reply('_Pdm Already Deactivated_');
        await getVar(['pdm'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_Pdm Message Deactivated_')
    }
});


Module({
    pattern: 'antidemote ?(.*)',
    desc: 'demote actor and re-promote demoted person',
    type: 'group',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('antidemote on/off');
    if (match != 'on' && match != 'off') return message.reply('antidemote on');
    const {antidemote} = await getVar(['antidemote'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
    if (antidemote == 'true') return message.reply('_Antidemote Already Enabled');
        await getVar(['antidemote'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_Antidemote Successfully Enabled_')
    } else if (match == 'off') {
           if (antidemote == 'false') return message.reply('_Already Deactivated_');
        await getVar(['antidemote'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_Antidemote Successfully Disabled_')
    }
});



Module({
    pattern: 'antipromote ?(.*)',
    desc: 'demote actor and re-promote demoted person',
    type: 'group',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('Antipromote on/off');
    if (match != 'on' && match != 'off') return message.reply('antipromote on');
    const {antipromote} = await getVar(['antipromote'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (antipromote == 'true') return message.reply('_Antipromote Already Activated_');
        await getVar(['antipromote'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_Antipromote Successfully Enabled_')
    } else if (match == 'off') {
        if (antipromote == 'false') return message.reply('_Antipromote Already Deactivated_');
        await getVar(['antipromote'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_Antipromote Successfully Disabled_')
    }
});

Module({
    pattern: 'antibot ?(.*)',
    desc: 'remove users who use bot',
    type: "group",
    onlyGroup: true,
    fromMe: true 
}, async (message, match) => {
    if (!match) return await message.reply("_*antibot* on/off_\n_*antibot* action warn/kick/null_");
    const {antibot} = await getVar(['antibot'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'on') {
    	const action = antibot && antibot.action ? antibot.action : 'null';
        await getVar(['antibot'], {jid: message.jid, content: {status: 'true', action }}, 'set');
        return await message.reply(`_antibot Activated with action null_\n_*antibot action* warn/kick/null for chaning actions_`)
    } else if(match.toLowerCase() == 'off') {
    	const action = antibot && antibot.action ? antibot.action : 'null';
        await getVar(['antibot'], {jid: message.jid, content: {status: 'false', action }}, 'set')
        return await message.reply(`_Antibot Disabled_`)
    } else if(match.toLowerCase().match('action')) {
    	const status = antibot && antibot.status ? antibot.status : 'false';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.reply('_action must be warn,kick or null_')
        await getVar(['antibot'], {jid: message.jid, content: {status, action: match }}, 'set')
        return await message.reply(`_AntiBot Action Updated_`);
    }
});




Module({
    pattern: 'antidelete ?(.*)',
    desc: 'forward deleted messages',
    type: 'group',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('antidelete on/off');
    if (match != 'on' && match != 'off') return message.reply('antidelete on');
    const {antidelete} = await getVar(['antidelete'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (antidelete == 'true') return message.reply('_Already activated_');
        await getVar(['antidelete'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_Antidelete Activated_')
    } else if (match == 'off') {
        if (antidelete == 'false') return message.reply('_Already Deactivated_');
        await getVar(['antidelete'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_Antidelete Deactivated_')
    }
});



Module({
    pattern: 'antifake ?(.*)',
    desc: 'remove fake numbers',
    fromMe: true,
    type: 'group',
    onlyGroup: true
}, async (message, match) => {
    if (!match) return await message.reply('_*antifake* 94,92_\n_*antifake* on/off_\n_*antifake* list_');
    const {antifake} = await getVar(['antifake'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase()=='get'){
    if(!antifake || antifake.status == 'false' || !antifake.data) return await message.reply('_Not Found_');
    return await message.reply(`_*activated restricted numbers*: ${antifake.data}_`);
    } else if(match.toLowerCase() == 'on') {
    	const data = antifake && antifake.data ? antifake.data : '';
    	await getVar(['antifake'], {jid: message.jid, content: {status: 'true', data}}, 'set');
        return await message.reply(`_Antifake Activated_`)
    } else if(match.toLowerCase() == 'off') {
        const data = antifake && antifake.data ? antifake.data : '';
    	await getVar(['antifake'], {jid: message.jid, content: {status: 'false', data}}, 'set');
    return await message.reply(`_Antifake Deactivated_`)
    }
    match = match.replace(/[^0-9,!]/g, '');
    if(!match) return await message.reply('value must be number');
    const status = antifake && antifake.status ? antifake.status : 'false';
    await getVar(['antifake'], {jid: message.jid, content: {status, data: match}}, 'set');
    return await message.reply(`_Antifake Updated_`);
});





Module({
    pattern: 'antilink ?(.*)',
    desc: 'remove users who use bot',
    type: "group",
    onlyGroup: true,
    fromMe: true 
}, async (message, match) => {
    if (!match) return await message.reply("_*antilink* on/off_\n_*antilink* action warn/kick/null_");
    const {antilink} = await getVar(['antilink'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'on') {
    	const action = antilink && antilink.action ? antilink.action : 'null';
        await getVar(['antilink'], {jid: message.jid, content: {status: 'true', action }}, 'set');
        return await message.reply(`_antilink Activated with action null_\n_*antilink action* warn/kick/null for chaning actions_`)
    } else if(match.toLowerCase() == 'off') {
    	const action = antilink && antilink.action ? antilink.action : 'null';
        await getVar(['antilink'], {jid: message.jid, content: {status: 'false', action }}, 'set')
        return await message.reply(`_Antilink deactivated_`)
    } else if(match.toLowerCase().match('action')) {
    	const status = antilink && antilink.status ? antilink.status : 'false';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.reply('_action must be warn,kick or null_')
        await getVar(['antilink'], {jid: message.jid, content: {status, action: match }}, 'set')
        return await message.reply(`_AntiLink Action Updated_`);
    }
});



Module({
    pattern: 'antiword ?(.*)',
    desc: 'remove users who use restricted words',
    type: "group",
    onlyGroup: true,
    fromMe: true 
}, async (message, match) => {
    if (!match) return await message.reply("_*antiword* on/off_\n_*antiword* action warn/kick/null_");
    const {antiword} = await getVar(['antiword'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get') {
    	const status = antiword && antiword.status == 'true' ? true : false
        if(!status  || !antiword.word) return await message.reply('_Not Found_');
        return await message.reply(`_*activated antiwords*: ${antiword.word}_`);
    } else if(match.toLowerCase() == 'on') {
    	const action = antiword && antiword.action ? antiword.action : 'null';
        const word = antiword && antiword.word ? antiword.word : undefined;
        await getVar(['antiword'], {jid: message.jid, content: {status: 'true', action, word}}, 'set');
        return await message.reply(`_antiword Activated with action null_\n_*antiword action* warn/kick/null for chaning actions_`)
    } else if(match.toLowerCase() == 'off') {
    	const action = antiword && antiword.action ? antiword.action : 'null';
        const word = antiword && antiword.word ? antiword.word : undefined;
        await getVar(['antiword'], {jid: message.jid, content: {status: 'false', action,word }}, 'set')
        return await message.reply(`_antiword deactivated_`)
    } else if(match.toLowerCase().match('action')) {
    	const status = antiword && antiword.status ? antiword.status : 'false';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.reply('_action must be warn,kick or null_')
        await getVar(['antiword'], {jid: message.jid, content: {status, action: match }}, 'set')
        return await message.reply(`_antiword Action Updated_`);
    } else {
    	if(!match) return await message.reply('_*Example:* antiword 🏳️‍🌈, gay, nigga_');
    	const status = antiword && antiword.status ? antiword.status : 'false';
        const action = antiword && antiword.action ? antiword.action : 'null';
        await getVar(['antiword'], {jid: message.jid, content: {status, action,word: match}}, 'set')
        return await message.reply(`_Antiwords Updated_`);
    }
});


Module({
        pattern: 'bcgroup ?(.*)',
        fromMe: true,
        desc: 'broadcast to all user in specified group',
        type: 'group',
        onlyGroup: true
}, async (message, match) => {
if(!message.reply_message.i) return await message.reply("_Reply to a Message_");
return await broadcast(message, match, "group");
});

Module({
        pattern: 'bcall ?(.*)',
        fromMe: true,
        desc: 'broadcast to all users',
        type: 'user'
}, async (message, match) => {
if(!message.reply_message.i) return await message.reply("_Reply to a Message_*");
return await broadcast(message, match, "all");
});

Module({
        pattern: 'bcpm ?(.*)',
        fromMe: true,
        desc: 'broadcast to all your pm messages',
        type: 'user'
        }, async (message, match) => {
if(!message.reply_message.i) return await message.reply("_Reply to a Message_");
return await broadcast(message, match, "pm");
});

Module({
        pattern: 'bcongroup ?(.*)',
        fromMe: true,
        desc: 'broadcast to all groups',
        type: 'groupr'
        }, async (message, match) => {
if(!message.reply_message.i) return await message.reply("_Reply to a Message_");
return await broadcast(message, match, "allgroup");
});

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	extractUrlsFromString,
	MODE,
	getJson,
	config,
	isInstagramURL
} = require("../lib");



Bixby({
	pattern: 'insta ?(.*)',
	desc: 'download Instagram medias',
	react: "😛",
	fromMe: MODE,
	type: "downloader",
}, async (message, match) => {
	if (match.startsWith('dl-url:')) {
		match = match.replace(/dl-url:/, '').replace("INSTAGRAM DOWNLOADER",'').trim();
		return await message.sendFromUrl(match);
	}
	match = match || message.reply_message.text;
	if (!match) return await message.send('_need instagram url_');
	const urls = extractUrlsFromString(match);
	if (!urls[0]) return await message.send('_No url found!_');
	if (!isInstagramURL(urls[0])) return await message.send('_Something went wrong, Please try again!_');
	let data = await getJson(`${config.BASE_URL}api/download/insta?apikey=${config.INRL_KEY}&url=${urls[0]}`);
	if (!data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
	const {
		result
	} = data;
	let options = [],
		n = 1;
	if (!result[0]) return await message.send('_No matching results found!_');
	result.map(async (u) => {
		options.push({
			name: `${n++}/${result.length}`,
			id: `insta dl-url:${u.url}`
		})
	});
	if (options.length == 1) return await message.sendFromUrl(result[0].url);
	return await message.send({
		name: "INSTAGRAM DOWNLOADER",
		values: options.splice(0, 10),
		withPrefix: true,
		onlyOnce: false,
		participates: [message.sender],
		selectableCount: true
	}, {}, 'poll');
});

Bixby({
	pattern: 'story ?(.*)',
	desc: 'download instagram story',
	react: "😛",
	fromMe: MODE,
	type: "downloader",
}, async (message, match) => {
	if (match.startsWith('dl-url:')) {
		match = match.replace(/dl-url:/, '').replace("INSTAGRAM STORY DOWNLOADER",'').trim();
		return await message.sendFromUrl(match);
	}
	match = match || message.reply_message.text;
	if (!match) return await message.send('_need instagram url_');
	const urls = extractUrlsFromString(match);
	if (!urls[0]) return await message.send('_Something went wrong, Please try again!_');
	if (!isInstagramURL(urls[0])) return await message.send('_No matching results found!_');
	let data = await getJson(`${config.BASE_URL}api/download/insta?apikey=${config.INRL_KEY}&url=${urls[0]}`);
	if (!data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
	const {
		result
	} = data;
	let options = [],
		n = 1;
	if (!result[0]) return await message.send('_No matching results found!_');
	result.map(async (u) => {
		options.push({
			name: `${n++}/${result.length}`,
			id: `insta dl-url:${u.url}`
		})
	});
	if (options.length == 1) return await message.sendFromUrl(result[0].url);
	return await message.send({
		name: "INSTAGRAM STORY DOWNLOADER",
		values: options.splice(0, 10),
		withPrefix: true,
		onlyOnce: false,
		participates: [message.sender],
		selectableCount: true
	}, {}, 'poll');
});

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE,
	isUrl,
	getJson,
	config
} = require("../lib");

Bixby({
		pattern: "pindl",
	        fromMe: MODE,
		desc: "pinterest download",
		type: "downloader",
	},
	async (message, match) => {
		if (!match) return await message.send('Please provide a Pinterest URL');
		if (!isUrl(match)) return await message.send('Please provide a valid Pinterest URL');
		const {
			result,
			status
		} = await getJson(`${config.BASE_URL}api/download/pinterest?url=${match}&apikey=${config.INRL_KEY}`);
		if (!status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
		await message.sendFromUrl(result.url);
	});

Bixby({
		pattern: "pins",
	        fromMe: MODE,
		desc: "pinterest search",
		type: "search",
	},
	async (message, match) => {
		if (match.startsWith('pin-dl:')) {
			match = match.replace(/pin-dl:/, '').replace("Pinterest search results 📋", '').trim();
			return await message.send({
				url: match
			}, {
				caption: 'Pinterest search results 📋'
			}, 'image');
		}
		if (!match) return await message.send('Please provide a Pinterest URL');
		if (isUrl(match)) await message.send('Please provide a valid Pinterest URL');
		const {
			result,
			status
		} = await getJson(`${config.BASE_URL}api/search/pinterest?text=${match}&apikey=${config.INRL_KEY}`);
		if (!status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
		let options = [],
			n = 1;
		for (const item of result) {
			options.push({
				name: `${n++}/${result.length}`,
				id: `pins pin-dl: ${item.url}`
			});
		}
		return await message.send({
			name: 'Pinterest search results 📋',
			values: options.splice(0, 10),
			withPrefix: true,
			onlyOnce: false,
			participates: [message.sender],
			selectableCount: true
		}, {}, 'poll');
	});

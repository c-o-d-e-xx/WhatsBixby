/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE,
	fetchJson,
	config
} = require("../lib");


Bixby({
	pattern: 'lyrics',
	fromMe: MODE,
	desc: 'find lyrics',
	type: "search"
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send('_give me a song name!_');
	const res = await fetchJson(`${config.BASE_URL}api/search/lyrics?text=${match}&apikey=${config.INRL_KEY}`);
	if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`)
	if (!res.result) return message.send('_Internal server Error!_');
	const {
		thumb,
		lyrics,
		title,
		artist
	} = res.result;
	
	const msg = `*_artist: ${artist}_*\n*_title: ${title}_*\n\n_${lyrics}_`;
        return await message.client.sendMessage(message.from, {
		image: {
			url: thumb
		},
		caption: msg
	}, {
		quoted: message
	})
});

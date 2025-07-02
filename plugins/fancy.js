/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE,
	config,
	getJson
} = require('../lib');
const axios= require('axios');

Bixby({
	pattern: 'fancy ?(.*)',
	type: 'utility',
	fromMe: MODE,
	desc: 'generate fancy text'
}, async (message, match) => {
	if (!match && !message.reply_message.text) {
		const res = await getJson(`${config.BASE_URL}api/tools/fancy?text=fancy 10 plugin&apikey=${config.INRL_KEY}&key=list`);
		if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
		return await message.send(res.result.map(a => a.fancy).join('\n'));
	}
	const id = match.match(/\d/g)?.join('')
	const text = match || message.reply_message.text;
	if (id === undefined && text) {
		const res = await axios.post(`${config.BASE_URL}api/tools/fancy`, {text,apikey: config.INRL_KEY, key:'list'});
		if (!res.data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
		return await message.send(res.data.result.map(a => a.fancy).join('\n'));
	}
	const res = await axios.post(`${config.BASE_URL}api/tools/fancy`, {text: text.replace(id,''),apikey: config.INRL_KEY, key: id});
	if (!res.data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
	return await message.send(res.data.result);
});

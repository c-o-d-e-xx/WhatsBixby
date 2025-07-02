/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const path = "./media/pdf";
const {
	Bixby,
	MODE,
	getRandom,
	config
} = require("../lib");


Bixby({
	pattern: 'pdf ?(.*)',
	desc: "Images/texts to PDF",
	type: 'converter',
	fromMe: MODE
	}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match && !message.reply_message.image) return await message.send("*reply to an image or text*\nuse pdf _help_ to clarify");
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	};
	if (match && match != "get" && !message.reply_message.image) {
		let fd = new FormData();
		fd.append('text', match);
		fd.append('apikey', config.INRL_KEY);
		fd.append('path', 'text.pdf');
		const response = await axios.post(`${config.BASE_URL}api/tools/pdf`, fd, {
			headers: fd.getHeaders()
		});
		if (!response.data.status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
		return await message.send({
			url: response.data.url
		}, {
			filename: 'document.pdf'
		}, 'document');
	} else if (message.reply_message.image) {
		const media = await message.reply_message.download();
		fs.writeFileSync('./media/pdf/' + getRandom('.jpg'), media);
		return await message.send("*Image added!*");
	} else if (match && match == "get") {
		let page = 1;
		const files = fs.readdirSync('./media/pdf');
		if (files.length == 0) return await message.send('*No image/message added*');
		let fd = new FormData();
		fd.append('path', 'files.pdf');
		fd.append('apikey', config.INRL_KEY);
		files.map(async (file) => {
			if (file != "pdf") {
				fd.append('files', file,'files.pdf');
			}
		});
		const response = await axios.post(`${config.BASE_URL}api/tools/pdf`, fd, {
			headers: fd.getHeaders()
		});
		if (!response.data.status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
		await message.send({
			url: response.data.url
		}, {
			filename: 'document.pdf'
		}, 'document');
		fs.rmSync(path, {
			recursive: true,
			force: true
		});
	}
});

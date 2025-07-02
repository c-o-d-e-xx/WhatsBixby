/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	TRT,
	MODE,
	Bixby
} = require("../lib");

Bixby({
		pattern: 'trt ?(.*)',
		fromMe: MODE,
		desc: 'convert texts to various languages',
		type: 'converter',
	},
	async (message, match) => {
		if (!message.reply_message.text)
			return await message.send(
				'reply to the msg for translate'
			)
		if (!match) return await message.send('give a language code eg:en');
		const {
			text
		} = await TRT(message.reply_message.text, match)
		return await message.send(text);
	}
)

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE
} = require("../lib");
const {
	fromBuffer
} = require("file-type");

Bixby({
	pattern: 'doc ?(.*)',
	desc: "convert media to document",
	react: "🔂",
	type: 'converter',
	fromMe: MODE
}, async (message, match) => {
	match = (match || "converted media").replace(/[^A-Za-z0-9]/g, '-');
	if (!
		message.reply_message.image &&
		!
		message.reply_message.audio &&
		!
		message.reply_message.video) return message.send("_*reply to a video/audio/image message!*_");
	const media = await message.reply_message.download(),
		{
			ext,
			mime
		} = await fromBuffer(media);
	return await message.client.sendMessage(message.jid, {
		document: media,
		mimetype: mime,
		fileName: match + "." + ext
	}, {
		quoted: message
	});
});

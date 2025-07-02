/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	extractUrlsFromString,
	searchYT,
	getYTInfo,
	GenListMessage,
	AudioMetaData,
	downloadMp3,
	downloadMp4,
	getBuffer,
	toAudio,
	MODE
} = require("../lib");

Bixby({
	pattern: 'play',
	type: "downloader",
	desc: 'download youtube video',
	fromMe: MODE
}, async (message, match) => {
	match = match || message.reply_message.text;
		if (!match) return await message.send('_give me some query_');
		const url = await extractUrlsFromString(match);
		if (!url[0]) {
			const result = await searchYT(match);
			if (!result[0]) return await message.send('_Not Found_');
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(result[0].url);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		} else {
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(url[0]);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		}
});
Bixby({
	on: 'text',
	fromMe: MODE
}, async (message, match) => {
	if (!message.reply_message?.fromMe || !message.reply_message?.text) return;
	if (!message.reply_message.text.includes('_Send number as reply to download_')) return;
		if (message.body.includes("• audio document")) {
			match = message.body.replace("• audio document", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp3(result[0].url);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.from, {
				document: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• audio")) {
			match = message.body.replace("• audio", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp3(result[0].url);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.jid, {
				audio: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video document")) {
			match = message.body.replace("• video document", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp4(result[0].url);
			return await message.client.sendMessage(message.from, {
				document: ress,
				mimetype:  'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video")) {
			match = message.body.replace("• video", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp4(result[0].url);
			return await message.client.sendMessage(message.from, {
				video: ress,
				mimetype: 'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4",
				caption: title
			}, {
				quoted: message.data
			});
		}
});

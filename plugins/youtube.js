const {
	Bixby,sleep,extractUrlsFromString,searchYT,downloadMp3,downloadMp4,
	linkPreview,getYTInfo,getBuffer,AudioMetaData,toAudio,config,MODE
} = require('../lib');


Bixby({
	pattern: 'song',
    fromMe: MODE,
	type: "downloader",
	desc: 'download audio from youtube'
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send('_Which song?_\n_eg: .song Arabic Kuthu_');
	const url = await extractUrlsFromString(match);
	if (!url[0]) {
		const result = await searchYT(match);
		if (!result[0]) return await message.send('_not found_');
		return await message.send({
			name: 'YOUTUBE SONG DOWNLOADER',
			values: result.splice(0,10).map(a=>({name:a.title, id: `song ${a.url}`})),
			withPrefix: true,
			onlyOnce: false,
			participates: [message.sender],
			selectableCount: true
		}, {}, 'poll');
	} else {
		const {
			seconds,
			title,
			thumbnail
		} = await getYTInfo(url[0]);
		const ress = await downloadMp3(url[0]);
		const AudioMeta = await AudioMetaData(await toAudio(ress), {
			title,
			image: thumbnail
		});
		return await message.send(AudioMeta, {
			mimetype: 'audio/mpeg',
			linkPreview: linkPreview({title, url:thumbnail})
		}, 'audio');
	}
});
Bixby({
	pattern: 'video',
	fromMe: MODE,
	type: "downloader",
	desc: 'download video from youtube'
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send('*Use : .video Al Quran!*');
	const url = await extractUrlsFromString(match);
	if (!url[0]) {
		const result = await searchYT(match);
		if (!result[0]) return await message.send('_not found_');
		return await message.send({
			name: 'YOUTUBE VIDEO DOWNLOADER',
			values: result.splice(0,10).map(a=>({name:a.title, id: `video ${a.url}`})),
			withPrefix: true,
			onlyOnce: false,
			participates: [message.sender],
			selectableCount: true
		}, {}, 'poll');
	} else {
		const ress = await downloadMp4(url[0]);
		await message.send(ress, {
			mimetype: 'video/mp4'
		}, 'video');
	}
});

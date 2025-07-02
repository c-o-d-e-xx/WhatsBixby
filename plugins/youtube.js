const {
	Bixby,sleep,extractUrlsFromString,searchYT,downloadMp3,downloadMp4,
	linkPreview,getYTInfo,getBuffer,AudioMetaData,config,MODE
} = require('../lib');

const { toAudio } = require("../lib/functions");

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
    try {
        match = match || (message.reply_message && message.reply_message.text);
        if (!match) {
            return await message.send('*Please provide a YouTube URL or search term.*\n*Example:* .video https://youtu.be/...');
        }

        // Show processing message
        await message.send('*⬇️ Downloading video...*');

        const urls = await extractUrlsFromString(match);
        if (!urls || !urls[0]) {
            // Handle search case
            const results = await searchYT(match);
            if (!results || !results.length) {
                return await message.send('*No videos found.*');
            }
            return await message.send({
                name: 'YOUTUBE VIDEO DOWNLOADER',
                values: results.slice(0, 10).map(a => ({
                    name: a.title,
                    id: `video ${a.url}`
                })),
                withPrefix: true,
                onlyOnce: false,
                participates: [message.sender],
                selectableCount: true
            }, {}, 'poll');
        }

        // Download video
        const result = await downloadMp4(urls[0]);
        
        if (result.error) {
            const errorMessages = {
                'VIDEO_TOO_LARGE': '*Video is too large (max 100MB)*',
                'STREAM_ERROR': '*Failed to process video stream*',
                'DOWNLOAD_FAILED': '*Failed to download video*'
            };
            return await message.send(errorMessages[result.error] || '*An error occurred*');
        }

        if (!result.buffer) {
            return await message.send('*Failed to process video*');
        }

        // Send the video
        return await message.send(result.buffer, {
            mimetype: 'video/mp4',
            caption: '*Here\'s your video!* 🎥'
        }, 'video');

    } catch (error) {
        console.error('Video command error:', error);
        return await message.send('*An error occurred while processing your request*');
    }
});
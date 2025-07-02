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
        // Properly handle match value
        match = match || (message.reply_message && message.reply_message.text);
        
        // Check if match exists
        if (!match) {
            return await message.send('*Please provide a YouTube URL or search term.\nExample: .video Al Quran*');
        }

        // Safely extract URLs
        let url;
        try {
            url = await extractUrlsFromString(match);
        } catch (error) {
            console.error('URL extraction error:', error);
            return await message.send('*Error processing the URL*');
        }

        // Handle direct URL case
        if (url && url[0]) {
            try {
                const ress = await downloadMp4(url[0]);
                if (!ress) {
                    return await message.send('*Failed to download video*');
                }
                return await message.send(ress, {
                    mimetype: 'video/mp4'
                }, 'video');
            } catch (downloadError) {
                console.error('Download error:', downloadError);
                return await message.send('*Error downloading the video*');
            }
        } 
        // Handle search case
        else {
            try {
                const result = await searchYT(match);
                if (!result || !result.length) {
                    return await message.send('*No videos found*');
                }
                
                return await message.send({
                    name: 'YOUTUBE VIDEO DOWNLOADER',
                    values: result.splice(0, 10).map(a => ({
                        name: a.title || 'Untitled',
                        id: `video ${a.url || ''}`
                    })).filter(item => item.id !== 'video '),
                    withPrefix: true,
                    onlyOnce: false,
                    participates: [message.sender],
                    selectableCount: true
                }, {}, 'poll');
            } catch (searchError) {
                console.error('Search error:', searchError);
                return await message.send('*Error searching for videos*');
            }
        }
    } catch (error) {
        console.error('Video command error:', error);
        return await message.send('*An unexpected error occurred*');
    }
});

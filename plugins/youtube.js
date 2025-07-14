const { Bixby, MODE } = require("../lib");
const axios = require("axios");

Bixby({
  pattern: 'ytv ?(.*)',
  fromMe: MODE,
  type: 'downloader',
  desc: 'downloads videos from youtube'
}, async (message, match) => {
  try {
    match = match || message.reply_message?.text;

    if (!match || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(match)) {
      return await message.send('*Please provide a valid YouTube URL.*\nExample: `.video https://youtu.be/...`');
    }

    await message.send('⬇️ *Processing your video...*');

    const { data } = await axios.get(`https://codexnet.xyz/ytv?url=${encodeURIComponent(match)}&apikey=L5Ce7iyZng`);

    const result = data?.result;
    if (!result?.success || !result?.download_url) {
      return await message.send('❌ *Failed to retrieve download link.*');
    }

    return await message.send(
      { url: result.download_url },
      {
        mimetype: 'video/mp4',
        caption: `🎬 *${result.title || 'YouTube Video'}*\n👤 ${result.author || 'Unknown'}\n📦 ${result.size_mb} MB`
      },
      'video'
    );

  } catch (err) {
    console.error('Video command error:', err);
    return await message.send('❌ *An error occurred while sending the video.*');
  }
});

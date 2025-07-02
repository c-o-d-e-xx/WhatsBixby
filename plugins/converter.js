/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    MODE,
    AudioMetaData
} = require("../lib");

const { toAudio, toVideo, toPTT, toGif } = require("../lib/functions");

const { AUDIO_DATA } = require("../config");

const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

Bixby({
    pattern: 'photo ?(.*)',
    desc: 'convert sticker to image',
    type: "converter",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.sticker) return await message.reply('_please reply to a sticker_');
    if (message.reply_message.isAnimatedSticker) return await message.reply('_please reply to a non animated sticker_');
    const media = await message.client.downloadAndSaveMediaMessage(message.reply_message.sticker);
    await ffmpeg(media)
        .fromFormat('webp_pipe')
        .save('output.png')
        .on('error', async (err) => {
            console.error("Photo conversion error:", err);
            return await message.send(`❌ *Error converting sticker to image:*\n${err.message}`);
        })
        .on('end', async () => {
            return await message.send(fs.readFileSync('output.png'), {}, 'image');
        });
});

Bixby({
    pattern: 'voice ?(.*)',
    desc: 'audio to ptt converter',
    type: "converter",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to video/audio message_');
    try {
        let media = await toPTT(await message.reply_message.download());
        return await message.send(media, {
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, 'audio');
    } catch (err) {
        console.error("Voice conversion error:", err);
        return message.send(`❌ *Failed to convert voice:*\n${err.message}`);
    }
});

Bixby({
  pattern: 'gif ?(.*)',
  desc: 'Convert video or animated sticker to GIF',
  type: "converter",
  fromMe: MODE
}, async (message) => {
  if (!message.reply_message.sticker && !message.reply_message.video)
    return message.reply('_Please reply to an animated sticker or video_');

  try {
    const filePath = await message.client.downloadAndSaveMediaMessage(
      message.reply_message.sticker || message.reply_message.video
    );

    const gifUrl = await toGif(filePath);

    await message.send({ url: gifUrl }, { gifPlayback: true, quoted: message.data }, 'video');
  } catch (err) {
    console.error("GIF conversion error:", err);
    return await message.send(`❌ *Error converting to GIF:*\n${err.message}`);
  }
});

Bixby({
    pattern: 'bass ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) {
        return message.reply('_please reply to an audio message_');
    }

    try {
        let inputPath = await message.client.downloadAndSaveMediaMessage(message.reply_message.audio);

        if (!inputPath || !fs.existsSync(inputPath)) {
            return await message.send("*Failed to download audio file.*");
        }

        let outputPath = './lib/temp/media/bass.mp3';

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(["-af equalizer=f=54:width_type=o:width=2:g=20"])
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        await message.client.sendMessage(message.from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mp4',
            ptt: false
        });

        fs.unlinkSync(inputPath); // optional: clean up
        fs.unlinkSync(outputPath); // optional: clean up

    } catch (err) {
        console.error('Bass error:', err);
        return await message.send(`❌ *Error generating bass audio:*\n${err.message}`);
    }
});

Bixby({
    pattern: 'slow ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .audioFilter("atempo=0.5")
        .outputOptions(["-y", "-af", "asetrate=44100*0.9"])
        .save("../lib/temp/slow.mp3")
        .on('error', async (err) => {
            console.error("Slow error:", err);
            return await message.send(`❌ *Error slowing audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/slow.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'blown ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-af acrusher=.1:1:64:0:log"])
        .save("../lib/temp/blown.mp3")
        .on('error', async (err) => {
            console.error("Blown error:", err);
            return await message.send(`❌ *Error generating blown audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/blown.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'deep ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-af atempo=1,asetrate=44500*2/3"])
        .save("../lib/temp/deep.mp3")
        .on('error', async (err) => {
            console.error("Deep error:", err);
            return await message.send(`❌ *Error generating deep audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/deep.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'earrape ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-af volume=12"])
        .save("../lib/temp/earrape.mp3")
        .on('error', async (err) => {
            console.error("Earrape error:", err);
            return await message.send(`❌ *Error generating earrape audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/earrape.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'fast ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-filter:a atempo=1.63,asetrate=44100"])
        .save("../lib/temp/fast.mp3")
        .on('error', async (err) => {
            console.error("Fast error:", err);
            return await message.send(`❌ *Error generating fast audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/fast.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'fat ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-filter:a atempo=1.6,asetrate=22100"])
        .save("../lib/temp/fat.mp3")
        .on('error', async (err) => {
            console.error("Fat error:", err);
            return await message.send(`❌ *Error generating fat audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/fat.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'nightcore ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-filter:a atempo=1.06,asetrate=44100*1.25"])
        .save("../lib/temp/nightcore.mp3")
        .on('error', async (err) => {
            console.error("Nightcore error:", err);
            return await message.send(`❌ *Error generating nightcore audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/nightcore.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'reverse ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-filter_complex areverse"])
        .save("../lib/temp/reverse.mp3")
        .on('error', async (err) => {
            console.error("Reverse error:", err);
            return await message.send(`❌ *Error generating reverse audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/reverse.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'squirrel ?(.*)',
    desc: 'audio edit',
    type: "audio-edit",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio) return message.reply('_please reply to an audio message_');
    await ffmpeg(await message.client.downloadAndSaveMediaMessage(message.reply_message.audio))
        .outputOptions(["-filter:a atempo=0.5,asetrate=65100"])
        .save("../lib/temp/squirrel.mp3")
        .on('error', async (err) => {
            console.error("Squirrel error:", err);
            return await message.send(`❌ *Error generating squirrel audio:*\n${err.message}`);
        })
        .on('end', async () => {
            await message.client.sendMessage(message.from, {
                audio: fs.readFileSync('../lib/temp/squirrel.mp3'),
                mimetype: 'audio/mp4',
                ptt: false
            });
        });
});

Bixby({
    pattern: 'mp3 ?(.*)',
    desc: 'video to mp3 converter',
    type: "converter",
    fromMe: MODE
}, async (message) => {
    if (!message.reply_message.audio && !message.reply_message.video) return message.reply('_please reply to a video/audio message_');
    try {
        const opt = {
            title: AUDIO_DATA.split(/[|,;]/)[0] || AUDIO_DATA,
            body: AUDIO_DATA.split(/[|,;]/)[1],
            image: AUDIO_DATA.split(/[|,;]/)[2]
        };
        const audioBuffer = await toAudio(await message.reply_message.download());
        const AudioMeta = await AudioMetaData(audioBuffer, opt);
        return await message.send(AudioMeta, { mimetype: 'audio/mpeg' }, 'audio');
    } catch (err) {
        console.error("MP3 conversion error:", err);
        return await message.send(`❌ *Error converting to MP3:*\n${err.message}`);
    }
});

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    fetchJson,
    getBuffer,
    sendUrl,
    MODE,
    AudioMetaData,
    toAudio,
    config
} = require("../lib");
const fs = require("fs");

Bixby({
    pattern: 'url',
    desc: 'convert image url',
    react: "⛰️",
    fromMe: MODE,
    type: "converter"
}, async (message, match) => {
    if (!message.isMedia) return message.reply('_please reply to image/sticker/video/audio_');
    return await sendUrl(message, message.client);
});

Bixby({
    pattern: 'take',
    desc: 'change sticker and audio authority',
    react: "⚒️",
    fromMe: MODE,
    type: "utility"
}, async (message, match) => {
        if (!message.reply_message.sticker && !message.reply_message.audio && !message.reply_message.image && !message.reply_message.video) return message.reply('reply to a sticker/audio');
        if (message.reply_message.sticker || message.reply_message.image || message.reply_message.video) {
            match = match || config.STICKER_DATA;
            let media = await message.reply_message.download();
            return await message.sendSticker(message.jid, media, {
                packname: match.split(/[|,;]/)[0] || match,
                author: match.split(/[|,;]/)[1]
            });
        } else if (message.reply_message.audio) {
            const opt = {
                title: match ? match.split(/[|,;]/) ? match.split(/[|,;]/)[0] : match : config.AUDIO_DATA.split(/[|,;]/)[0] ? config.AUDIO_DATA.split(/[|,;]/)[0] : config.AUDIO_DATA,
                body: match ? match.split(/[|,;]/)[1] : config.AUDIO_DATA.split(/[|,;]/)[1],
                image: (match && match.split(/[|,;]/)[2]) ? match.split(/[|,;]/)[2] : config.AUDIO_DATA.split(/[|,;]/)[2]
            }
            const AudioMeta = await AudioMetaData(await toAudio(await message.reply_message.download()), opt);
            return await message.send(AudioMeta,{
                mimetype: 'audio/mpeg'
            },'audio');
        }
    })

Bixby({
    pattern: 'emix',
    desc: 'mix two emojis to a sticker',
    react: "🤌",
    fromMe: MODE,
    type: "create"
}, async (message, match) => {
    if (!match) return message.send('*Example:-* .emix 😵‍💫+😅');
    if (!match.includes(/[|,;]/)) return message.send('*Example:-* .emix 😵‍💫+😅');
    let emoji1, emoji2;
    if (match.includes(/[|,;]/)) {
        let split = match.split(/[|,;]/);
        emoji1 = split[0];
        emoji2 = split[1];
    }
    let md = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
    for (let res of md.results) {
        return await message.sendSticker(message.jid, res.url, {
                packname: config.STICKER_DATA.split(/[|,;]/)[0] || config.STICKER_DATA,
                author: config.STICKER_DATA.split(/[|,;]/)[1]
        });
    }
})

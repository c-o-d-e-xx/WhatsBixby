const {
    Module,
    isPublic,
    sendPhoto,
    sendVoice,
    sendGif,
    sendBass,
    sendSlow,
    sendBlown,
    sendDeep,
    sendErrape,
    sendFast,
    sendFat,
    sendNightcore,
    sendReverse,
    sendSquirrel,
    toAudio,
    toPTT,
    toVideo,
    AudioMetaData,
    labg,
    config
} = require('../lib');

Module({
    pattern: 'photo ?(.*)',
    desc: 'Convert sticker to Photo',
    type: "converter",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.sticker) return  await message.reply("_Replay Non animated sticker message__");
    if(message.reply_message.isAnimatedSticker) return  await message.reply("_please reply to a non animated sticker_");
    return await sendPhoto(message);
});
Module({
    pattern: 'mp4 ?(.*)',
    desc: 'Convert To mp4',
    type: "converter",
    fromMe: isPublic
}, async (message, match) => {
    if (!message.reply_message.sticker) return message.reply("_Replay any animated sticker message_");
    if(!message.reply_message.isAnimatedSticker) return  await message.reply("_please reply to an animated sticker_");
    let media = await toVideo(await message.reply_message.download())
    return await message.send(media,{
        mimetype: 'video/mp4',
    },'video')
});
Module({
    pattern: 'voice ?(.*)',
    desc: 'Convert Voice Messags',
    type: "converter",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Any video/audio message_");
    let media = await toPTT(await message.reply_message.download())
    return await message.send(media,{
        mimetype: 'audio/mpeg',
        ptt: true, 
    }, 'audio')
});
Module({
    pattern: 'gif ?(.*)',
    desc: 'Convert To gift Message',
    type: "converter",
    fromMe: isPublic
}, async (message) => {
    
    if (!message.reply_message.sticker || message.reply_message.video) return message.reply("_Replay animated sticker/video message_");
    return await sendGif(message)
});
Module({
    pattern: 'bass ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Any Audio Message_");
    return await sendBass(message)
});
Module({
    pattern: 'slow ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendSlow(message)
});
Module({
    pattern: 'blown ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendBlown(message)
});
Module({
    pattern: 'deep ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendDeep(message);
});
Module({
    pattern: 'earrape ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendErrape(message)
});
Module({
    pattern: 'fast ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendFast(message)
});
Module({
    pattern: 'fat ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendFat(message);
});
Module({
    pattern: 'nightcore ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendNightcore(message);
});
Module({
    pattern: 'reverse ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendReverse(message);
});
Module({
    pattern: 'squirrel ?(.*)',
    desc: 'Edit Your Audio Messages',
    type: "audio edit",
    fromMe: isPublic
}, async (message) => {
    if (!message.reply_message.audio) return message.reply("_Replay Audio Message_");
    return await sendSquirrel(message);
});

Module({
    pattern: 'mp3 ?(.*)',
    desc: 'Convert Video to Mp3',
    type: "converter",
    fromMe: isPublic
}, (async (message) => {
    if (!message.reply_message.audio && !message.reply_message.video) return message.reply("_Replay Any Video/Audio_");
    const opt = {
                title: config.AUDIO_DATA.split(/[|,;]/)[0] || config.AUDIO_DATA,
                body: config.AUDIO_DATA.split(/[|,;]/)[1],
                image: config.AUDIO_DATA.split(/[|,;]/)[2]
            }
    const AudioMeta = await AudioMetaData(await toAudio(await message.reply_message.download()), opt);
    return await message.send(AudioMeta,{
        mimetype: 'audio/mpeg', quoted: message
    },'audio')
}));



Module(
  {
    pattern: "sticker",
    fromMe: isPublic,
    desc: 'Convert Your Images Videos in Sticker',
    type : 'converter'
      },
  async (message, match) => {
    if (!/image|video|webp/.test(message.mime)) return await message.reply(
      lang.STICKER.ERROR
        );
     if (message.reply_message.mime) {
        let download = await message.reply_message.download();
        return await message.sendSticker(message.jid, download, {
          author: config.STICKER_DATA.split(/[|;,]/)[0] || config.STICKER_DATA,
          packname: config.STICKER_DATA.split(/[|;,]/)[1],
        });
      } else if (/image|video|webp/.test(message.mime)) {
        let download = await message.client.downloadMediaMessage(message);
        return await message.sendSticker(message.jid, download, {
          author: config.STICKER_DATA.split(/[|;,]/)[0] || config.STICKER_DATA,
          packname: config.STICKER_DATA.split(/[|;,]/)[1],
        });
      } else {
        return await message.reply(
          lang.STICKER.ERROR
        );
      }
  }
);


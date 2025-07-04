const {
    Bixby,
    MODE,
    getJson
} = require("../lib/");
const jimp = require("jimp");
const QRReader = require("qrcode-reader");
const { BASE_URL, API_KEY } = require("../config");

Bixby({
    pattern: 'qr ?(.*)',
    fromMe: MODE,
    desc: 'qr code reader & generater',
    type: 'plugin'
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!message.reply_message.image && !match) 
        return await message.reply("_Reply to a qr image/text message_");
    if (message.reply_message.image) {
        const { bitmap } = await jimp.read(await message.reply_message.download());
        const qr = new QRReader();
        qr.callback = (err, value) => message.reply(err ?? value.result);
        qr.decode(bitmap);
    } else {
        const url = `${BASE_URL}api/qrcode?text=${encodeURIComponent(match)}&apikey=${encodeURIComponent(API_KEY)}`;
        return await message.sendReply(url, {
            caption: "*result for* ```" + match + "```"
        }, "image");
    }
});

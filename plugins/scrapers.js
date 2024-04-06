const { TRT, TTS, isPublic, Module, lang } = require('../lib');

Module(
	{
		pattern: 'trt ?(.*)',
		fromMe: isPublic,
		desc: 'langauge Changer',
		type: 'converter',
	},
	async (message, match) => {
		if (!message.reply_message.text)
			return await message.reply(
				lang.TRT.NEED
			)
                if(!match) return await message.reply(lang.TRT.NEED_LANG);
                const {text} = await TRT(message.reply_message.text, match)
		return await message.reply(text);
	}
)


Module({
    pattern: 'tts',
    fromMe: isPublic,
    desc: 'Convert ypur text to audio',
    type: "converter"
}, async (message, match) => {
        match = match || message.reply_message.text;
        if (!match) return await message.reply(lang.BASE.TEXT);
        let slang = match.match('\\{([a-z]+)\\}');
        let lang = "en";
        if (slang) {
            lang = slang[1];
            match = match.replace(slang[0], '');
        }
        return await message.send(await TTS(match,lang),{
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false,
            quoted: message 
        },'audio');
});




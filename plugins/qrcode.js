const {
	Bixby,
	MODE
} = require("../lib/");
const axios = require("axios");
const FormData = require("form-data");
const {
	BASE_URL,
	API_KEY
} = require("../config");

Bixby({
	pattern: 'qr ?(.*)',
	fromMe: MODE,
	desc: 'QR code reader & generator',
	type: 'plugin'
}, async (message, match) => {
	match = match || message.reply_message?.text;

	if (!message.reply_message?.image && !match)
		return await message.reply("_Reply to a QR image or provide text to generate QR code_");

	if (message.reply_message?.image) {
		try {
			const imgBuffer = await message.reply_message.download();

			const form = new FormData();
			form.append("file", imgBuffer, "qr.png");

			const response = await axios.post(`${BASE_URL}qr-reader?apikey=${API_KEY}`, form, {
				headers: form.getHeaders()
			});

			const result = response.data?.result;

			if (!result)
				return await message.reply("❌ Could not read QR code.");

			return await message.reply(`✅ *QR Content:* \`\`\`${result}\`\`\``);
		} catch (err) {
			console.error(err);
			return await message.reply("❌ Error reading QR code.");
		}

	} else {
		try {
			const qrUrl = `${BASE_URL}qrcode?text=${encodeURIComponent(match)}&apikey=${encodeURIComponent(API_KEY)}`;
			return await message.sendReply(qrUrl, {
				caption: `*Generated QR for:* \`\`\`${match}\`\`\``
			}, "image");
		} catch (err) {
			console.error(err);
			return await message.reply("❌ Error generating QR code.");
		}
	}
});

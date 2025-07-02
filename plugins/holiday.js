/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE
} = require("../lib");
const {
	EncodeInput
} = require("../lib/functions");
const {
	BASE_URL,
	API_KEY
} = require("../config");
const axios = require("axios");

Bixby({
		pattern: "holiday",
		fromMe: MODE,
		desc: "get holiday list",
		type: "misc",
	},
	async (message, match) => {
		if (!match) return await message.send("Provide input in the format 'CountryCode;Year'");

		const [country, year] = match.split(";");
		if (!country || !year) {
			return await message.send("Invalid format. Use 'CountryCode;Year' (e.g., 'IN;2024').");
		}

		try {
			const encodedCountry = await EncodeInput(country, {
				toUpperCase: true
			});
			const encodedYear = await EncodeInput(year);

			const response = await axios.get(
				`${BASE_URL}holiday?country=${encodedCountry}&year=${encodedYear}&apikey=${API_KEY}`
			);

			const holidays = response.data;

			if (!holidays || holidays.length === 0) {
				return await message.send(`No holidays found for ${encodedCountry} in ${encodedYear}.`);
			}

			const formattedHolidays = holidays
				.map((holiday) => {
					return `🌟 *${holiday.name}*\n📅 Date: ${holiday.date}\n📆 Observed: ${holiday.observed}\n🔓 Public: ${holiday.public ? "Yes" : "No"}\n`;
				})
				.join("\n---\n");

			const formattedMessage = `*Holidays in ${encodedCountry} (${encodedYear}):*\n\n${formattedHolidays}`;

			const imgUrl = "https://github.com/c-o-d-e-xx/c-o-d-e-xx/blob/main/img/holiday.jpeg?raw=true";

			await message.send({
					url: imgUrl
				}, {
					caption: formattedMessage
				},
				"image"
			);
		} catch (error) {
			console.error(error);
			await message.send("Failed to fetch holiday data. Please try again later.");
		}
	}
);

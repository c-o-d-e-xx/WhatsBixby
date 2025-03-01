const { Bixby, isPrivate } = require("../lib");
const { EncodeInput } = require("../lib/functions");
const { BASE_URL, API_KEY } = require("../config");
const axios = require("axios");

Bixby({
    pattern: "holiday",
    fromMe: isPrivate,
    desc: "Get holiday",
    type: "misc",
},
async (m, match) => {
    match = match || m.reply_message.text;
    if (!match) return await m.reply("Provide input in the format 'CountryCode;Year'");

    const [country, year] = match.split(";");
    if (!country || !year) {
        return await m.reply("Invalid format. Use 'CountryCode;Year' (e.g., 'IN;2024').");
    }

    try {
        const encodedCountry = await EncodeInput(country, { toUpperCase: true });
        const encodedYear = await EncodeInput(year);

        const response = await axios.get(`${BASE_URL}holiday?country=${encodedCountry}&year=${encodedYear}&apikey=${API_KEY}`);
        
        const holidays = response.data;

        if (!holidays || holidays.length === 0) {
            return await m.reply(`No holidays found for ${encodedCountry} in ${encodedYear}.`);
        }

        const formattedHolidays = holidays.map(holiday => {
            return `🌟 *${holiday.name}*\n📅 Date: ${holiday.date}\n📆 Observed: ${holiday.observed}\n🔓 Public: ${holiday.public ? "Yes" : "No"}\n`;
        }).join("\n---\n");

        await m.reply(`Holidays in ${encodedCountry} (${encodedYear}):\n\n${formattedHolidays}`);
    } catch (error) {
        console.error(error);
        await m.reply("Failed to fetch holiday data. Please try again later.");
    }
});
/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib");
const { BASE_URL, API_KEY } = require("../config");
const axios = require("axios");

Bixby({
    pattern: "holiday",
    fromMe: isPrivate,
    desc: "get holiday",
    type: "misc",
}, 
async (m, match) => {
    match = match || m.reply_message.text;
    if (!match) return await m.reply("Provide input in the format 'CountryCode;Year'");

    const [country, year] = match.split(";"); // Split the match into country and year
    if (!country || !year) {
        return await m.reply("Invalid format. Use 'CountryCode;Year' (e.g., 'IN;2024').");
    }

    try {
        const response = await axios.get(`${BASE_URL}holiday?country=${country}&year=${year}&apikey=${API_KEY}`);
        const result = response.data; // Extract data from the response
        await m.reply(JSON.stringify(result, null, 2)); // Reply with the result (formatted)
    } catch (error) {
        console.error(error);
        await m.reply("Failed to fetch holiday data. Please try again later.");
    }
});

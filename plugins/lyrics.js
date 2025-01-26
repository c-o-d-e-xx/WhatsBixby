/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const axios = require("axios");
const { Bixby, isPrivate } = require("../lib");
const { BASE_URL, API_KEY } = require("../config");

Bixby(
  {
    pattern: "lyrics",
    fromMe: isPrivate,
    desc: "Searches for lyrics based on the format: song;artist",
    type: "tools",
  },
  async (message, match) => {
    match = match || message.reply_message.text
    try {
      if (!match || !match.includes(";")) {
        return await message.reply(
          "Invalid format. Use the format: \n\t_lyrics song;artist_"
        );
      }

      const [song, artist] = match.split(";").map((item) => item.trim());

      if (!song || !artist) {
        return await message.reply(
          "Both song and artist must be provided. Use the format: \n\t_lyrics song;artist_"
        );
      }

      const response = await axios.get(
        `${BASE_URL}genius?song=${encodeURIComponent(
          song
        )}&artist=${encodeURIComponent(artist)}&apikey=${API_KEY}`
      );

      const result = response.data?.result;

      if (result) {
        return await message.reply(result);
      } else {
        return await message.reply(
          "No lyrics found for the specified song and artist."
        );
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error.message || error);
      return await message.reply("An error occurred while fetching lyrics. Please try again later.");
    }
  }
);

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/


const { Bixby, isPrivate } = require("../lib");
const axios = require("axios");
const { BASE_URL, API_KEY } = require("../config");

Bixby(
  {
    pattern: "ig",
    fromMe: isPrivate,
    desc: "insta profile search",
    type: "stalk",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    const args = match ? match.trim() : '';
    if (!args) return await message.reply("*_Give me user name_*");

    try {
      const response = await axios.get(`${BASE_URL}stalk/ig?id=${args}&apikey=${API_KEY}`);
      const { fullname = 'N/A', username, post_count = 0, following = 0, followers = 0, biography = 'N/A', is_private, is_verified } = response.data.result || {};
      const profile_pic_url = response.data.result?.hd_profile_pic_url_info?.url || '';

      if (!username) {
        return await message.reply("*_User not found. Please check the username and try again._*");
      }

      const Text = `\`\`\`\nusername : ${username}\nname : ${fullname}\nposts : ${post_count}\nfollowers : ${followers}\nfollowing : ${following}\nprivate account: ${is_private}\nverified account: ${is_verified}\nbio : ${biography}\n\`\`\``;

      const buttonMessage = {
        image: { url: profile_pic_url },
        caption: Text,
      };
      await message.client.sendMessage(message.jid, buttonMessage, { quoted: message });
    } catch (error) {
      console.error(error);
      await message.reply("*_An error occurred while fetching the Instagram profile. Please try again later._*");
    }
  }
);

Bixby(
  {
    pattern: "tiktok",
    fromMe: isPrivate,
    desc: "tiktok profile search",
    type: "stalk",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    const args = match ? match.trim() : '';
    if (!args) return await message.reply("*_Give me user name_*");

    try {
      const response = await axios.get(`${BASE_URL}stalk/tiktok?id=${args}&apikey=${API_KEY}`);
      const { uniqueId, nickname, avatar, verified, bioLink, privateAccount, followers, following, hearts, videos } = response.data.result.data;
      const profile_pic_url = response.data.result?.hd_profile_pic_url_info?.url || '';

      if (!username) {
        return await message.reply("*_User not found. Please check the username and try again._*");
      }

      const Text = `\`\`\`\nusername : ${uniqueId}\nname : ${nickname}\nfollowers : ${followers}\nfollowing : ${followers}\nfollowing : ${following}\nprivate account: ${privateAccount}\nverified account: ${verified}\nbio : ${bioLink}\nlikes : ${hearts}\nvideos : ${videos}\n\`\`\``;

      const buttonMessage = {
        image: { url: profile_pic_url },
        caption: Text,
      };
      await message.client.sendMessage(message.jid, buttonMessage, { quoted: message });
    } catch (error) {
      console.error(error);
      await message.reply("*_An error occurred while fetching the Tiktok profile. Please try again later._*");
    }
  }
);


Bixby(
  {
    pattern: "github",
    fromMe: isPrivate,
    desc: "get user data from github",
    type: "stalk",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    const args = match.trim();

    if (!args) return await message.reply("*_Give me user name_*");

    try {
      const apiUrl = `${BASE_URL}stalk/github?id=${args}&apikey=${API_KEY}`;
      
      const response = await axios.get(apiUrl);

      // Check if response.data.result exists before destructuring
      if (!response.data.result) {
        return await message.reply("*_User data not found. Please check the username and try again._*");
      }

      const { login, name, bio, followers, public_repos, following, blog, avatar_url } = response.data.result;
      const gittext = `* USER GITHUB INFORMATION *\n👤 Username: *${login}*\n👤 Name: *${name || 'N/A'}*\n👩‍💻 Bio: *${bio || 'N/A'}*\n🐌 Followers: *${followers}*\n🌷 Public Repos: *${public_repos}*\n👥 Following: *${following}*\n🌐 Website: ${blog || 'N/A'}`;
      await message.client.sendMessage(
        message.jid,
        {
          image: { url: avatar_url },
          caption: gittext,
        },
        { quoted: message }
      );
    } catch (error) {
      console.error(error);
      await message.reply("*_An error occurred while fetching user data. Please try again later._*");
    }
  }
);


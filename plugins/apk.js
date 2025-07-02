/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, MODE } = require("../lib");
const axios = require("axios");
const { BASE_URL, API_KEY } = require("../config");

// Configure Axios to handle errors better
axios.defaults.timeout = 10000; // 10s timeout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

Bixby({
  pattern: 'apk ?(.*)',
  type: "downloader",
  desc: "Download applications from Aptoide",
  fromMe: MODE
}, async (message, match) => {
  try {
    match = match || message.reply_message?.text;
    if (!match) return await message.send("*Please provide an app name or ID*");

    // --- DOWNLOAD MODE (dl-id:) ---
    if (match.startsWith('dl-id:')) {
      const appId = match.replace(/dl-id:/, '').replace('APK DOWNLOADER', '').trim();
      const downloadUrl = `${BASE_URL}download/aptoide?apk=${encodeURIComponent(appId)}&apikey=${API_KEY}`;
      
      console.log("📤 Download API Request:", downloadUrl); // Debug log

      const response = await axios.get(downloadUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "BixbyBot/1.0"
        }
      });

      if (!response.data?.status) {
        console.error("API Error Response:", response.data);
        return await message.send(
          `❌ API Error: ${response.data?.message || "Unknown error"}\n` +
          `Get a new key: ${BASE_URL}api/signup\n` +
          `Current key: ${API_KEY?.slice(0, 3)}...${API_KEY?.slice(-3)}`
        );
      }

      console.log("🔗 Download Link:", response.data.result.link); // Debug log
      return await message.send(
        { url: response.data.result.link },
        {
          mimetype: "application/vnd.android.package-archive",
          fileName: response.data.result.name + ".apk"
        },
        'document'
      );
    }

    // --- SEARCH MODE ---
    const searchUrl = `${BASE_URL}search/aptoide?apk=${encodeURIComponent(match)}&apikey=${API_KEY}`;
    console.log("🔍 Search API Request:", searchUrl); // Debug log

    const response = await axios.get(searchUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "BixbyBot/1.0"
      }
    });

    if (!response.data?.status) {
      console.error("API Error Response:", response.data);
      return await message.send(
        `❌ API Error: ${response.data?.message || "Unknown error"}\n` +
        `Get a new key: ${BASE_URL}api/signup\n` +
        `Current key: ${API_KEY?.slice(0, 3)}...${API_KEY?.slice(-3)}`
      );
    }

    const results = response.data.result.slice(0, 10).map(app => ({
      name: `${app.name} (${app.id})`,
      id: `apk dl-id:${app.id}`
    }));

    return await message.send(
      {
        name: '📲 APK DOWNLOADER',
        values: results,
        withPrefix: true,
        onlyOnce: true,
        participates: [message.sender],
        selectableCount: true
      },
      {},
      'poll'
    );

  } catch (error) {
    console.error("‼️ Critical Error:", error);
    return await message.send(
      `⚠️ Failed to process request\n` +
      `Error: ${error.message}\n` +
      `Check console for details`
    );
  }
});

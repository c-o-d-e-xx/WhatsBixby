/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, getBuffer, MODE } = require("../lib");
const { EncodeInput } = require("../lib/functions");
const { BASE_URL, API_KEY } = require("../config");
const axios = require("axios");

// COVID Command
Bixby({
  pattern: "covid",
  fromMe: MODE,
  desc: "get covid stats of a country",
  type: "info",
}, async (message, match) => {
  if (!match) {
    return await message.send('*🦠 Provide a country name!*\n_Example: corona India_');
  }

  try {
    const enccountry = await EncodeInput(match, { toLowerCase: true });
    const response = await axios.get(`${BASE_URL}covid?q=${enccountry}&apikey=${API_KEY}`);
    const { result } = response.data;

    if (!result || result.status !== 200) {
      return await message.send('*❌ Failed to fetch data. Check country name or your API key.*');
    }

    const {
      country, totalCases, totalDeaths, totalRecovered,
      information, fullInformationLink, covidimg
    } = result;

    const formatted = `🦠 *COVID - 19 Stats for ${match}*\n\n🌍 *Country:* ${country || 'N/A'}\n📊 *Total Cases:* ${totalCases || 'N/A'}\n💀 *Total Deaths:* ${totalDeaths || 'N/A'}\n💚 *Total Recovered:* ${totalRecovered || 'N/A'}\n🕒 *Info Updated:* ${information || 'N/A'}\n🔗 *More Info:* ${fullInformationLink || 'N/A'}`;

    const sent = await message.send({ url: covidimg }, { caption: formatted }, "image");
    return await message.send({ key: sent.key, text: "🧼" }, {}, "react");

  } catch (err) {
    console.error(err);
    return await message.send('*❌ An error occurred while fetching COVID-19 information.*');
  }
});

// NPM Command
Bixby({
  pattern: "npm",
  fromMe: MODE,
  desc: "Searches Npm package",
  type: "info",
}, async (message, match) => {
  match = match || message.reply_message.text;
  if (!match) {
    return await message.reply("*_Enter npm package name!_*");
  }

  let response;
  try {
    const encoded = await EncodeInput(match);
    response = await axios.get(`${BASE_URL}search/npm?text=${encoded}&apikey=${API_KEY}`);
  } catch (err) {
    console.error("Axios request failed", err);
    return await message.send("❌ Failed to search NPM packages.");
  }

  if (!response.data.status) {
    return await message.send(
      `⚠️ Your API key limit has been exceeded. You need to get a new key:\n${BASE_URL}api/signup\n\nThen run: setvar inrl_key: your_new_apikey`
    );
  }

  const results = response.data.result.results || [];
  if (results.length === 0) {
    return await message.send("No NPM packages found for your search.");
  }

  const formattedResults = results.map(({ package: pkg }) =>
    `📦 *${pkg.name}* (v${pkg.version})\n🔗 ${pkg.links.npm}\n📝 ${pkg.description || "No description available"}`
  ).join("\n\n────────────────\n");

  const npmImage = "https://github.com/npm/logos/blob/master/npm%20logo/npm-logo-red.png?raw=true";

  try {
    const msg = await message.send({ url: npmImage }, {
      caption: `🔍 *NPM Search Results for:* ${match}\n\n${formattedResults}`
    }, "image");

    await message.send({ key: msg.key, text: "✅" }, {}, "react");
  } catch (sendErr) {
    console.error("Failed to send NPM image message:", sendErr);
    return await message.send(`🔍 *NPM Search Results for:* ${match}\n\n${formattedResults}`);
  }
});

// IMDB Command
Bixby({
  pattern: "imdb",
  fromMe: MODE,
  desc: "get data from imdb",
  type: "info",
}, async (message, match) => {
  if (!match) return await message.send("*Please provide a movie name.*");

  try {
    const encoded = await EncodeInput(match);
    const response = await axios.get(`${BASE_URL}imdb?movie=${encoded}&apikey=${API_KEY}`);
    if (!response.data.status) {
      return await message.send(
        `⚠️ Your API key limit has been exceeded. You need to get a new key:\n${BASE_URL}api/signup\n\nThen run: setvar inrl_key: your_new_apikey`
      );
    }

    const movie = response.data.result || {};
    const ratings = Array.isArray(movie.Ratings)
      ? movie.Ratings.map(r => `\n - ${r.Source}: ${r.Value}`).join("")
      : "N/A";

    const formattedMessage = `🎬 *Title:* ${movie.Title || "N/A"}\n📅 *Year:* ${movie.Year || "N/A"}\n⭐ *Rated:* ${movie.Rated || "N/A"}\n⏱️ *Runtime:* ${movie.Runtime || "N/A"}\n🎭 *Genre:* ${movie.Genre || "N/A"}\n🎥 *Director:* ${movie.Director || "N/A"}\n👥 *Actors:* ${movie.Actors || "N/A"}\n📝 *Plot:* ${movie.Plot || "N/A"}\n🌍 *Country:* ${movie.Country || "N/A"}\n🌟 *Ratings:* ${ratings}\n💰 *Box Office:* ${movie.BoxOffice || "N/A"}`;

    const msg = movie.Poster && movie.Poster !== "N/A"
      ? await message.send({ url: movie.Poster }, { caption: formattedMessage }, "image")
      : await message.send(formattedMessage);

    await message.send({ key: msg.key, text: "✅" }, {}, "react");

  } catch (err) {
    console.error("Axios request failed", err);
    return await message.send("❌ Failed to fetch from IMDB API.");
  }
});

// AGE Command
Bixby({
  pattern: "age",
  fromMe: MODE,
  desc: "get birth details",
  type: "info",
}, async (message, match) => {
  if (!match) return await message.send("*Please provide your date of birth.*");

  let [a, b, c] = match.split(/[/-]/);
  if (!c) return await message.send('*Invalid format!*\n*Example: dd/mm/yyyy*');
  if (a.length < 2) a = '0' + a;
  if (b.length < 2) b = '0' + b;
  if (c.length !== 4) return await message.send('*Invalid format!*\n*Example: dd/mm/yyyy*');

  try {
    const encoded = await EncodeInput(match);
    const response = await axios.get(`${BASE_URL}info/age?dob=${encoded}&apikey=${API_KEY}`);
    const data = response.data;

    if (!data.status) {
      return await message.send(
        `⚠️ Your API key limit has been exceeded. You need to get a new key:\n${BASE_URL}api/signup\n\nThen run: setvar inrl_key: your_new_apikey`
      );
    }

    const {
      age, months, days, hours, minutes, seconds,
      next: { date, remainingMonths, remainingDays, remainingHours, remainingMinutes, remainingSeconds }
    } = data.result;

    const formattedMessage = `🎂 *AGE DETAILS*\n\n*Age:* ${age}\n🕰️ *Lifetime Stats*\n• Months: ${months}\n• Days: ${days}\n• Hours: ${hours}\n• Minutes: ${minutes}\n• Seconds: ${seconds}\n\n🎉 *Time Left for Next Birthday*\n• Date: ${date}\n• Months Left: ${remainingMonths}\n• Days Left: ${remainingDays}\n• Hours Left: ${remainingHours}\n• Minutes Left: ${remainingMinutes}\n• Seconds Left: ${remainingSeconds}`;

    const imgUrl = "https://github.com/c-o-d-e-xx/c-o-d-e-xx/blob/main/img/ageapi.png?raw=true";
    const msg = await message.send({ url: imgUrl }, { caption: formattedMessage }, "image");
    await message.send({ key: msg.key, text: "✅" }, {}, "react");

  } catch (err) {
    console.error("Axios request failed", err);
    return await message.send("❌ Failed to fetch from AGE API.");
  }
});

// COUNTRY Command
Bixby({
  pattern: "country",
  fromMe: MODE,
  desc: "get country details",
  type: "info",
}, async (message, match) => {
  if (!match) return await message.send('*Provide a country code!*\n*Example: country IN*');

  try {
    const response = await axios.get(`${BASE_URL}country?code=${match}&apikey=${API_KEY}`);
    const { result, status } = response.data;

    if (!status) {
      return await message.send(
        `Please enter a new apikey, as the given apikey limit has been exceeded.\nVisit ${BASE_URL}api/signup to get a new apikey.\n*setvar inrl_key: your apikey*`
      );
    }

    const {
      name, language, capital, currency, famous_us, constitutional_form,
      language_codes, neighbors, image, flag, phoneCode, times, date
    } = result;

    const languages = typeof language === 'string' ? language.split(/\s*,\s*/) : language || [];
    const neighborList = typeof neighbors === 'string' ? neighbors.split(/\s*,\s*/) : neighbors || [];
    const languageCodeList = typeof language_codes === 'string' ? language_codes.split(/\s*,\s*/) : language_codes || [];

    const formattedMessage = `🌍 *Country:* ${name}\n🏛️ *Capital:* ${capital || 'N/A'}\n🗣️ *Languages:* ${languages.join(', ') || 'N/A'}\n💱 *Currency:* ${currency || 'N/A'}\n📌 *Famous For:* ${famous_us || 'N/A'}\n📜 *Constitutional Form:* ${constitutional_form || 'N/A'}\n🔤 *Language Codes:* ${languageCodeList.join(', ') || 'N/A'}\n🌐 *Neighbors:* ${neighborList.join(', ') || 'N/A'}\n🇺🇳 *Flag:* ${flag || 'N/A'}\n📅 *Date:* ${date || 'N/A'}\n📞 *Phone Code:* ${phoneCode || 'N/A'}\n🕒 *Local Time:* ${times?.[0] ? `${times[0].time} (${times[0].zone})` : 'N/A'}`;

    const msg = await message.send({ url: image }, { caption: formattedMessage }, "image");
    return await message.send({ key: msg.key, text: flag }, {}, 'react');

  } catch (err) {
    console.error(err);
    return await message.send('*❌ Failed to fetch country info. Please try again later.*');
  }
});

// Check API Key Command
Bixby({
  pattern: "checkapi",
  fromMe: MODE,
  desc: "check apikey limit",
  type: "info",
}, async (message) => {
  try {
    const response = await axios.get(`${BASE_URL}checkapikey?apikey=${API_KEY}`);
    const { status, apikey, total_limit, total_requests, remaining_limit, creator } = response.data;

    if (status !== 200) {
      return await message.send("*❌ API request failed.*");
    }

    const msg = `🔑 *API KEY:* ${apikey}\n👤 *CREATOR:* ${creator}\n📈 *MAX REQ LIMIT:* ${total_limit}\n📊 *TOTAL REQUESTS:* ${total_requests}\n🧮 *REMAINING LIMIT:* ${remaining_limit}`;
    const imageUrl = "https://cdn-icons-png.flaticon.com/512/6905/6905323.png";

    const sent = await message.send({ url: imageUrl }, { caption: msg }, "image");
    return await message.send({ key: sent.key, text: "✅" }, {}, "react");

  } catch (error) {
    console.error(error);
    return await message.send("*❌ Error occurred while checking API.*");
  }
});

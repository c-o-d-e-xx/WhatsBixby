/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

// Core
const { serialize, WAConnection } = require("./core");

// Events
const { Bixby, commands } = require("./events");

// Language
const { language, getString } = require("./lang");

// Functions
const {
    isAdmin,
	isBotAdmin,
	getCompo,
	getDate,
	parsedJid,
	PREFIX,
	MODE,
	extractUrlsFromString,
	getJson,
	isIgUrl,
	getUrl,
	isNumber,
	MediaUrls,
	isInstagramURL,
	linkPreview,
	AudioMetaData,
	addSpace,
	sendUrl,
	send_menu,
	send_alive,
	poll,
	getRandom,
	getBuffer,
	fetchJson,
	runtime,
	sleep,
	isUrl,
	bytesToSize,
	getSizeMedia,
	check
    // If needed: cutAudio, cutVideo, toAudio, toPTT
} = require("./function");

// Sticker
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExifWebp
} = require("./sticker");

// Mention
const { mention } = require("./mention");

// WCG
const { WCG } = require("./wcg");

// Config
const config = require("../config");

// YouTube
const {
    stream2buffer,
    searchYT,
    downloadMp3,
    downloadMp4,
    GenListMessage,
    TTS,
    TRT,
    getYTInfo
} = require("./youtube");

module.exports = {
    Bixby,
    commands,
    serialize,
    WAConnection,
    language,
    getString,
    isInstagramURL,
    linkPreview,
    AudioMetaData,
    addSpace,
    sendUrl,
    send_menu,
    send_alive,
    poll,
    getRandom,
    getBuffer,
    fetchJson,
    runtime,
    sleep,
    isUrl,
    bytesToSize,
    getSizeMedia,
    check,
    isAdmin,
    isBotAdmin,
    getCompo,
    getDate,
    parsedJid,
    PREFIX,
    MODE,
    extractUrlsFromString,
    getJson,
    isIgUrl,
    getUrl,
    isNumber,
    MediaUrls,
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExifWebp,
    mention,
    config,
    WCG,
    stream2buffer,
    searchYT,
    downloadMp3,
    downloadMp4,
    GenListMessage,
    TTS,
    TRT,
    getYTInfo
};

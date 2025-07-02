/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE
} = require("../lib");
const bgm = require("../lib/lang/bgm.json");
const {
	BGMBOT
} = require("../config");

Bixby({
	on: 'text',
	fromMe: MODE
}, async (m, match) => {
	if (!BGMBOT) return;
	if (m.isCreator) return;
	let audios = [];
	const add = m.body.toLowerCase().trim().split(' ') || [m.body.toLowerCase().trim()];
	for (let key in bgm) {
		add.forEach(s => {
			if (s.toLowerCase() == key.toLowerCase()) {
				audios.push(bgm[key]);
			}
		})
	}
	const mp3 = audios[Math.floor(Math.random() * audios.length)];
	if (!mp3) return;
	return await m.send({
		url: mp3.trim()
	}, {
		mimetype: "audio/mp4",
		ptt: true
	}, 'audio');
})

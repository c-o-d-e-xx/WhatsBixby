/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	Bixby,
	MODE,
	config,
	getBuffer,
	getJson,
} = require("../lib");

const { elevenlabs } = require("../lib/functions");

Bixby({
	pattern: 'aitts ?(.*)',
	type: "eva",
	fromMe: MODE,
	desc: 'gernate ai voices'
}, async (message, match) => {
	if (match == 'list') return await message.send(`╭「 *List of Aitts* 」
 ├ 1 _rachel_ 
 ├ 2 _clyde_ 
 ├ 3 _domi_ 
 ├ 4 _dave_ 
 ├ 5 _fin_ 
 ├ 6 _bella_ 
 ├ 7 _antoni_ 
 ├ 8 _thomas_ 
 ├ 9 _charlie_ 
 ├ 10 _emily_ 
 ├ 11 _elli_ 
 ├ 12 _callum_ 
 ├ 13 _patrick_ 
 ├ 14 _harry_ 
 ├ 15 _liam_ 
 ├ 16 _dorothy_ 
 ├ 17 _josh_ 
 ├ 18 _arnold_ 
 ├ 19 _charlotte_ 
 ├ 20 _matilda_ 
 ├ 21 _matthew_ 
 ├ 22 _james_ 
 ├ 23 _joseph_ 
 ├ 24 _jeremy_ 
 ├ 25 _michael_ 
 ├ 26 _ethan_ 
 ├ 27 _gigi_ 
 ├ 28 _freya_ 
 ├ 29 _grace_ 
 ├ 30 _daniel_ 
 ├ 31 _serena_ 
 ├ 32 _adam_ 
 ├ 33 _nicole_ 
 ├ 34 _jessie_ 
 ├ 35 _ryan_ 
 ├ 36 _sam_ 
 ├ 37 _glinda_ 
 ├ 38 _giovanni_ 
 ├ 39 _mimi_ 
 └`)
	const [v, k] = match.split(/,;|/);
	if (!k) return await message.send(`*_need voice id and text_*\n_example_\n\n_*aitts* hey vroh its a test,adam_\n_*aitts list*_`)
	const stream = await elevenlabs(match);
	if (!stream) return await message.send(`_*please upgrade your api key*_\n_get key from http://docs.elevenlabs.io/api-reference/quick-start/introduction_\n_example_\n\nsetvar elvenlabs: your key\n_or update your config.js manually_`);
	return await message.send({
		stream
	}, {
		mimetype: 'audio/mpeg'
	}, 'audio')
})

Bixby({
    pattern: 'gpt ?(.*)',
    desc: 'get open ai chatgpt response',
    type: "eva",
    fromMe: MODE
}, async (message, match) => {
    if(match && match == 'clear') {
        await GPT.clear();
        return await message.send('_successfully cleard_');
    }
    match = match || message.reply_message.text;
        if (!match) return await message.reply('_please can you provide me a task_');
        if(!config.OPEN_AI) {
            const res = await getJson(`${config.BASE_URL}api/ai/chatgpt?text=${match}&apikey=${config.INRL_KEY}`);
            if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar API_KEY: your apikey`);
            return await message.send(res.result);
        } 
        return await message.send(await GPT.prompt(match));
});

Bixby({
	pattern: 'diffusion ?(.*)',
	type: "eva",
	desc: "stable diffusion ai",
	fromMe: MODE
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send("*please give me an query!*");
	const res = await getBuffer(`${config.BASE_URL}api/ai/diffusion?text=${match}&apikey=${config.INRL_KEY}`);
	return await message.send(res, {},'image');
});

Bixby({
	pattern: 'gemini ?(.*)',
	type: "eva",
	fromMe: MODE,
	desc: "gemini ai",
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send("*please give me an query!*");
	const res = await getJson(`${config.BASE_URL}api/ai/gemini?text=${match}&apikey=${config.INRL_KEY}`);
	if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar API_KEY: your apikey`);
	return await message.send(res.result);
});

Bixby({
	pattern: 'bard ?(.*)',
	type: "eva",
	fromMe: MODE,
	desc: "bard ai",
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send("*please give me an query!*");
	const res = await getJson(`${config.BASE_URL}api/ai/bard?text=${match}&apikey=${config.INRL_KEY}`);
	if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar API_KEY: your apikey`);
	return await message.send(res.result);
});

Bixby({
	pattern: 'bing ?(.*)',
	type: "eva",
	fromMe: MODE,
	desc: "bing ai",
}, async (message, match) => {
	match = match || message.reply_message.text;
	if (!match) return await message.send("*please give me an query!*");
	const res = await getBuffer(`${config.BASE_URL}api/ai/bing?text=${match}&apikey=${config.INRL_KEY}`);
	return await message.send(res, {},'image');
});

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    MODE,
    config,
    getJson
} = require("../lib");

const axios = require("axios");

const postJson = async (id, options) => {
    const res = await axios.post(`${config.BASE_URL}api/program/${id}`, options);
    return res.data;
}

Bixby({
    pattern: 'emorece ?(.*)',
    fromMe: MODE,
    desc: "convert ASCII to morece",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* emorece i am not here to impress you!_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const data = await getJson(config.BASE_URL + `api/program/morece_encode?text=${match}&apikey=${config.INRL_KEY}`);
    if (!data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(data.result, {
        quoted: message.data
    }, 'text');
});
Bixby({
    pattern: 'dmorece ?(.*)',
    fromMe: MODE,
    desc: "decode morece to ASCII",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* demorece •• / •- -- / -• --- - / •••• • •-• • / - --- / •• -- •--• •-• • ••• ••• / -•-- --- ••- -•-•--_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const data = await getJson(config.BASE_URL + `api/program/morece_decode?text=${match}&apikey=${config.INRL_KEY}`);
    if (!data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(data.result, {
        quoted: message.data
    }, 'text');
});
Bixby({
    pattern: 'ujs ?(.*)',
    desc: "minify JavaScript",
    fromMe: MODE,
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* ujs const canvas = document.getElementById("canvas");\nconst dataURL = canvas.toDataURL();\nconsole.log(dataURL);_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const res = await postJson('js_minify', options);
    if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(res.result, {
        quoted: message.data
    }, 'text');
});
Bixby({
    pattern: 'ojs ?(.*)',
    fromMe: MODE,
    desc: "obfuscate JavaScript",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* ojs const canvas = document.getElementById("canvas");\nconst dataURL = canvas.toDataURL();\nconsole.log(dataURL);_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const res = await postJson('js_obfuscate', options);
    if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(res.result, {
        quoted: message.data
    }, 'text');
});
Bixby({
    pattern: 'bjs ?(.*)',
    fromMe: MODE,
    desc: "beautify JavaScript",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* bjs const canvas = document.getElementById("canvas");\nconst dataURL = canvas.toDataURL();\nconsole.log(dataURL);_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const res = await postJson('js_beautify', options);
    if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(res.result, {
        quoted: message.data
    }, 'text');
});
Bixby({
    pattern: 'bcss ?(.*)',
    fromMe: MODE,
    desc: "beautify css",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* bcss reply to a css content_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const res = await postJson('css_beautify', options);
    if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(res.result, {
        quoted: message.data
    }, 'text');

});
Bixby({
    pattern: 'bhtml ?(.*)',
    fromMe: MODE,
    desc: "beautify html",
    type: 'program',
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('_*Example:* bhtml reply to a html contents_');
    let options = {
        apikey: config.INRL_KEY,
        text: match
    };
    const res = await postJson('html_beautify', options);
    if (!res.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
    return await message.send(res.result, {
        quoted: message.data
    }, 'text');

});

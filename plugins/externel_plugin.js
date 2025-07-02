/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
    Bixby,
    extractUrlsFromString,
    config,
    linkPreview
} = require("../lib");
const { personalDB } = require("../lib/db");

const {
    exec
} = require("child_process");
const axios = require("axios");
const fs = require("fs");

Bixby({
    pattern: 'restart ?(.*)',
    desc: 'restart bot',
    react: "🥱",
    type: "system",
    fromMe: true
}, async (message, match) => {
    await message.send('```restarting```',{linkPreview: linkPreview()})
    process.exit(0);
})

Bixby({
    pattern: 'plugin ?(.*)',
    desc: 'install external plugins',
    react: "🦥",
    type: "system",
    fromMe: true
}, async (message, match) => {
    match = match || message.reply_message.text;
    let text = "",
        name, urls;
    if (match && extractUrlsFromString(match)) {
        await message.send('```please wait```', {linkPreview: linkPreview()})
        const urll = extractUrlsFromString(match);
        if (!urll[0]) return  message.send('```invalid url```', {linkPreview: linkPreview()})
        urll.map(async (url) => {
            let NewUrl = !url?.toString().includes('/raw') ? url.toString() : url.toString().split('/raw')[0];
            let plugin_name;
            let {
                data,
                status
            } = await axios(NewUrl + '/raw').catch((e) => {
                return message.send('```url must be a valid url or gist url```', {linkPreview: linkPreview()})
            })
            if (status == 200) {
                try {
                    plugin_name = data.match(/(?<=pattern:) ["'](.*?)["']/g).map(match => match.trim().split(" ")[0]).join(', ').replace(/'/g, '').replace(/"/g, '');
                    fs.writeFileSync(__dirname + "/" + plugin_name.split(',')[0] + ".js", data);
                    require("./" + plugin_name.split(',')[0]);
                } catch (e) {
                    fs.unlinkSync(__dirname + "/" + plugin_name.split(',')[0] + ".js");
                    return await message.send(e);
                }
                await message.send(`_newly installed plugins are *${plugin_name}*_`,{ linkPreview: linkPreview()})
                await personalDB(['plugins'], {
                    content: {
                        [plugin_name.split(',')[0]]: NewUrl
                    }
                }, 'add');
                fs.unlinkSync(__dirname + "/" + plugin_name.split(',')[0] + ".js");
            }
        });
    } else {
        const {
            plugins
        } = await personalDB(['plugins'], {
            content: {}
        }, 'get');
        if (!Object.keys(plugins)[0]) return await message.send('```no plugins found```', {linkPreview:linkPreview()})
        let text = '*LIST OF EXTERNAL PLUGINS*'
        for (const p in plugins) {
            text += `_*${p}*_\n_${plugins[p]}_\n\n`;
        };
        return await message.send(text,{linkPreview:linkPreview()})
    }
})
Bixby({
    pattern: 'remove ?(.*)',
    desc: 'remove installed external plugin',
    react: "😶",
    type: "system",
    fromMe: true
}, async (message, match) => {
    if (!match) return await message.send("*Give me a plugin name thet you want to remove*",{linkPreview:linkPreview()});
    const {
        plugins
    } = await personalDB(['plugins'], {
        content: {}
    }, 'get');
    if (!Object.keys(plugins)[0]) return await message.send('```no plugins found```', {linkPreview:linkPreview()})
    let Available = false;
    for (const p in plugins) {
        if (p == match) {
            Available = true;
            await personalDB(['plugins'], {
                content: {
                    id: match
                }
            }, 'delete');
            await message.send('_plugin successfully removed_',{linkPreview:linkPreview()});
            break;
        }
    }
    if (!Available) return await message.send('```no plugins found```', {linkPreview:linkPreview()})
});

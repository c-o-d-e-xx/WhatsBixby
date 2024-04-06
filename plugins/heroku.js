const simpleGit = require('simple-git');
const git = simpleGit();
const exec = require('child_process').exec;
const Heroku = require('heroku-client');
const axios = require("axios");
const {
        PassThrough
} = require('stream');
const heroku = new Heroku({
        token: process.env.HEROKU_API_KEY
})
//function used
function secondsToDhms(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
}
const {
        Module,
        GenListMessage,
        lang,
        config
} = require('../lib');


Module({
        pattern: 'setvar ?(.*)',
        fromMe: true,
        desc: 'Set heroku config var',
        type: 'heroku'
}, async (message, match) => {
        if (!match) return await message.reply('_Either Key or Value is missing_');
        const [key, value] = match.split(':');
        if (!key || !value) return await message.reply('setvar STICKER_DATA: Jsl;MD');
        await heroku.patch('/apps/' + process.env.HEROKU_APP_NAME + '/config-vars', {
                body: {
                        [key.trim().toUpperCase()]: match.replace(key,'').replace(':','').trim()
                }
        }).then(async () => {
                await message.reply('Successfully Set ' + '```' + key + '➜' + match.replace(key,'').replace(':','').trim() + '```')
        }).catch(async (error) => {
                await message.reply(`HEROKU : ${error.body.message}`)
        })
})
Module({
        pattern: 'delvar ?(.*)',
        fromMe: true,
        desc: 'Delete heroku config var',
        type: 'heroku'
}, async (message, match) => {
        if (!match) return await message.reply('_Either Key or Value is missing_');
        await heroku.get('/apps/' + process.env.HEROKU_APP_NAME + '/config-vars').then(async (vars) => {
                for (vr in vars) {
                        if (match == vr) {
                                await heroku.patch('/apps/' + process.env.HEROKU_APP_NAME + '/config-vars', {
                                        body: {
                                                [match.toUpperCase()]: null
                                        }
                                });
                                return await message.reply('```{} successfully deleted```'.replace('{}', match));
                        }
                }
                await message.reply('```No results found for this key```');
        }).catch(async (error) => {
                await message.reply(`HEROKU : ${error.body.message}`);
        });
});


Module({
        pattern: 'getvar ?(.*)',
        fromMe: true,
        desc: 'show all config var',
        type: 'settings'
}, async (message, match) => {
        let msg = "*_all config vars_*\n\n",
                got = false;
        for (const key in config) {
                if (key != 'DATABASE' && key != 'BASE_URL' && key != 'HEROKU' && key != 'SESSION_ID') {
                        if (!match) {
                                msg += `_*${key}* : ${config[key]}_\n`;
                        } else if (match.toUpperCase() == key) {
                                return await message.reply(`_*${match.toUpperCase()}* : ${config[key]}_`);
                                got = true;
                                break;
                        }
                }
        }
        if (match && !got) return await message.reply('_thet requested key not found_\n_try *getvar* to get all variables_');
        return await message.reply(msg);
});

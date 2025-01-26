/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {LANGUAGE} = require('../config');
const {existsSync,readFileSync} = require('fs');
var json = existsSync(__dirname+'/language/' + LANGUAGE + '.json') ? JSON.parse(readFileSync(__dirname+'/language/' + LANGUAGE + '.json')) : JSON.parse(readFileSync(__dirname+'/language/english.json'));
console.log("ꜱᴇʟᴇᴄᴛᴇᴅ ʟᴀɴɢᴜᴀɢᴇ :" +LANGUAGE)
function getString(file) { return json['STRINGS'][file]; }
module.exports = {language: json, getString: getString }

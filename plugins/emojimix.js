/* Copyright (C) 2023 DX-MODS.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
WhatsBixby - Ziyan
*/

const { Bixby, isPublic } = require("../lib");
const { BASE_URL, API_KEY } = require("../config");
const {bixbybuffer} = require('bixby-md');

Bixby({pattern: "emojimix ?(.*)",fromMe: isPublic,desc: "make two emojis to one image",type: "maker"},
async(message, match) => {
match = match || message.reply_message.text;
    if (!match) return await message.reply("*enter any two emoji split with comma*");
function _0x5b47(_0x49f64d,_0x1a22cb){var _0x1515aa=_0x1515();return _0x5b47=function(_0x5b47cf,_0x5e9509){_0x5b47cf=_0x5b47cf-0xfc;var _0x3fc06c=_0x1515aa[_0x5b47cf];return _0x3fc06c;},_0x5b47(_0x49f64d,_0x1a22cb);}(function(_0x1f9661,_0x5e04ce){function _0x47396a(_0x79a87f,_0x4d93a0){return _0x5b47(_0x79a87f-0x3b9,_0x4d93a0);}var _0x4af405=_0x1f9661();while(!![]){try{var _0xf4d244=-parseInt(_0x47396a(0x4b9,0x4be))/0x1*(parseInt(_0x47396a(0x4c0,0x4bf))/0x2)+-parseInt(_0x47396a(0x4bb,0x4bc))/0x3*(parseInt(_0x47396a(0x4b8,0x4b5))/0x4)+-parseInt(_0x47396a(0x4be,0x4bb))/0x5+-parseInt(_0x47396a(0x4bc,0x4c2))/0x6*(parseInt(_0x47396a(0x4bd,0x4b8))/0x7)+parseInt(_0x47396a(0x4b6,0x4b7))/0x8+parseInt(_0x47396a(0x4b5,0x4bb))/0x9+parseInt(_0x47396a(0x4ba,0x4b8))/0xa;if(_0xf4d244===_0x5e04ce)break;else _0x4af405['push'](_0x4af405['shift']());}catch(_0x58323b){_0x4af405['push'](_0x4af405['shift']());}}}(_0x1515,0x4f73d));function _0xbc3d12(_0x5b7f5a,_0x935a3e){return _0x5b47(_0x935a3e-0xe6,_0x5b7f5a);}if(match[_0xbc3d12(0x1f1,0x1ec)](',')){var split=match[_0xbc3d12(0x1e2,0x1e4)](',');emoji1=split[0x0],emoji2=split[0x1];}function _0x1515(){var _0x437e3a=['981386wzWqng','2385785HXEvrz','includes','8yTtUAK','1520514QDXlmb','768880CknGeL','split','728cBpFpj','10039zUnArD','9295580gXXoMY','3489FcHDsV','6tpnMuB'];_0x1515=function(){return _0x437e3a;};return _0x1515();}
var api_url = `${BASE_URL}api/emojimix?text=${emoji1}&text1=${emoji2}&apikey=${API_KEY}`
(function(_0x3a87be,_0x32dfc0){var _0x507bf7=_0x3a87be();function _0x94e94a(_0x47b1e4,_0x39cb4c){return _0x2cc0(_0x39cb4c-0x26f,_0x47b1e4);}while(!![]){try{var _0xe7aac3=-parseInt(_0x94e94a(0x3a2,0x39e))/0x1+parseInt(_0x94e94a(0x3a6,0x3a2))/0x2*(parseInt(_0x94e94a(0x39e,0x39d))/0x3)+parseInt(_0x94e94a(0x3aa,0x3a5))/0x4*(parseInt(_0x94e94a(0x39f,0x3a1))/0x5)+parseInt(_0x94e94a(0x39e,0x3a4))/0x6+-parseInt(_0x94e94a(0x39e,0x39c))/0x7*(-parseInt(_0x94e94a(0x3a4,0x3a3))/0x8)+parseInt(_0x94e94a(0x39d,0x3a0))/0x9+parseInt(_0x94e94a(0x395,0x39b))/0xa*(-parseInt(_0x94e94a(0x39c,0x39f))/0xb);if(_0xe7aac3===_0x32dfc0)break;else _0x507bf7['push'](_0x507bf7['shift']());}catch(_0x25c598){_0x507bf7['push'](_0x507bf7['shift']());}}}(_0x280b,0xd2d09));function _0x280b(){var _0x4e57be=['2810folGgJ','7VmKfSD','543258Cxjjzc','1396757MKZXYN','11088SNaMlx','6823917HUWXhY','182795RFICAG','4BszBnS','1900592AAGhVi','5358426AJUyNW','32QRJzcM'];_0x280b=function(){return _0x4e57be;};return _0x280b();}function _0x2cc0(_0xb626bc,_0x15cffe){var _0x280b1e=_0x280b();return _0x2cc0=function(_0x2cc054,_0x28a844){_0x2cc054=_0x2cc054-0x12c;var _0x4eb816=_0x280b1e[_0x2cc054];return _0x4eb816;},_0x2cc0(_0xb626bc,_0x15cffe);}var image=await bixbybuffer(api_url);const buttonMessage={'image':image};

message.client.sendMessage(message.jid, buttonMessage, { quoted: message })

})
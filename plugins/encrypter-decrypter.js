/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib/");
const { eBinary, dBinary, octalToText, textToOctal } = require("../lib/functions/");

Bixby({
       pattern: "ebinary",
       fromMe: isPrivate,
       desc: "encrypt text to binary",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me a text to encrypt")
m.reply(await eBinary(match));
});

Bixby({
       pattern: "dbinary",
       fromMe: isPrivate,
       desc: "decrypt binary to text",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me a binary code")
m.reply(await dBinary(match));
});

Bixby({
       pattern: "ebase64",
       fromMe: isPrivate,
       desc: "encrypt text to base64",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me text to encrypt in base64")
var encodedString = btoa(match);
m.reply(encodedString);
});

Bixby({
       pattern: "dbase64",
       fromMe: isPrivate,
       desc: "decrypt base64 to text",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me base64 to decrypt")
var decodedString = atob(match);
m.reply(decodedString);
});

Bixby({
       pattern: "eascii",
       fromMe: isPrivate,
       desc: "encrypt text to ascii",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("give text to convert to ascii")
const text = match;
const asciiValues = [];

for (let i = 0; i < text.length; i++) {
  const asciiCode = text.charCodeAt(i);
  asciiValues.push(asciiCode);
}

m.reply(asciiValues);
});

Bixby({
       pattern: "dascii",
       fromMe: isPrivate,
       desc: "decrypt ascii to text",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me ascii to decrypt")
const decodeascii = String.fromCharCode(match);
m.reply(decodeascii);
});

Bixby({
       pattern: "ehex",
       fromMe: isPrivate,
       desc: "encrypt text to hexadecimal",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me any text")
const myString = match;
const encodedHex = Buffer.from(myString).toString('hex');
m.reply(encodedHex);
});

Bixby({
       pattern: "dhex",
       fromMe: isPrivate,
       desc: "decrypt hexadecimal to text",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me any hexadecimal")
const encodedHex = match;
const decodedString = Buffer.from(encodedHex, 'hex').toString();
m.reply(decodedString);
});

Bixby({
       pattern: "eoctal",
       fromMe: isPrivate,
       desc: "convert text to octal",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me any text")
var inputText = match;
var octalText = textToOctal(inputText);
m.reply("Octal representation of '" + inputText + "': " + octalText);
});

Bixby({
       pattern: "doctal",
       fromMe: isPrivate,
       desc: "convert octal to text",
       type: "encrypter",
}, 
async (m, match) => {
match = match || m.reply_message.text
if (!match) return await m.reply("Give me any octal")
var inputOctal = match;
var textResult = octalToText(inputOctal);
m.reply("Converted text: " + textResult);
});

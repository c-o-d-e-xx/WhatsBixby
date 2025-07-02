/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { LANGUAGE } = require("../config");
const { existsSync, readFileSync } = require("fs");

const path = __dirname + '/lang/' + LANGUAGE + '.json';
const json = JSON.parse(readFileSync(existsSync(path) ? path : __dirname + '/lang/english.json'));

function getString(path) {
  const parts = path.split('.');
  let result = json;

  for (const part of parts) {
    result = result?.[part];
    if (result === undefined) return undefined;
  }

  return result;
}

module.exports = { language: json, getString };

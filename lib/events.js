/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

let commands = [];
function Bixby(info, func) {
  commands.push({...info, function: func});
  return info;
}
module.exports = { Bixby, commands };

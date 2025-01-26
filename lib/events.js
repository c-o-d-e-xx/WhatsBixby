/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require("../config");
const commands = [];

/**
 * Define a command and store it in the commands array.
 * @param {Object} commandInfo - Information about the command.
 * @param {Function} func - The function to execute when the command is triggered.
 * @returns {Object} - The command information.
 */
function Bixby(commandInfo, func) {
  commandInfo.function = func;
  if (commandInfo.pattern) {
    commandInfo.pattern =
    new RegExp(
      `(${config.HANDLERS})( ?${commandInfo.pattern}(?=\\b|$))(.*)`,
      "is"
    ) || false;
    }
  commandInfo.dontAddCommandList = commandInfo.dontAddCommandList || false;
  commandInfo.fromMe = commandInfo.fromMe || false;
  commandInfo.type = commandInfo.type || "misc";

  commands.push(commandInfo);
  return commandInfo;
}

module.exports = {
  Bixby,
  commands,
};


const config = require("../config");
const commands = [];

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


/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { getFilter, setFilter, deleteFilter } = require("../lib/db/filters");
const { Bixby, isPrivate} = require("../lib");

Bixby(
  {
    pattern: "filter",
    fromMe: true,
    desc: "Adds a filter. When someone triggers the filter, it sends the corresponding response. To view your filter list, use `.filter`.",
    usage: ".filter keyword:message",
    type: "group",
  },
  async (message, match) => {
    let text, msg;
    try {
      [text, msg] = match.split(":");
    } catch {}
    if (!match) {
      filtreler = await getFilter(message.jid);
      if (filtreler === false) {
        await message.reply("No filters are currently set in this chat.");
      } else {
        var mesaj = "Your active filters for this chat:" + "\n\n";
        filtreler.map(
          (filter) => (mesaj += `✒ ${filter.dataValues.pattern}\n`)
        );
        mesaj += "use : .filter keyword:message\nto set a filter";
        await message.reply(mesaj);
      }
    } else if (!text || !msg) {
      return await message.reply(
        "```use : .filter keyword:message\nto set a filter```"
      );
    } else {
      await setFilter(message.jid, text, msg, true);
      return await message.reply(`_Sucessfully set filter for ${text}_`);
    }
  }
);

Bixby(
  {
    pattern: "stop",
    fromMe: true,
    desc: "Stops a previously added filter.",
    usage: '.stop "hello"',
    type: "group",
  },
  async (message, match) => {
    if (!match) return await message.reply("\n*Example:* ```.stop hello```");

    del = await deleteFilter(message.jid, match);
    await message.reply(`_Filter ${match} deleted_`);

    if (!del) {
      await message.reply("No existing filter matches the provided input.");
    }
  }
);

Bixby(
  { on: "text", fromMe: false, dontAddCommandList: true },
  async (message, match) => {
    var filtreler = await getFilter(message.jid);
    if (!filtreler) return;
    filtreler.map(async (filter) => {
      pattern = new RegExp(
        filter.dataValues.regex
          ? filter.dataValues.pattern
          : "\\b(" + filter.dataValues.pattern + ")\\b",
        "gm"
      );
      if (pattern.test(match)) {
        await message.reply(filter.dataValues.text, {
          quoted: message,
        });
      }
    });
  }
);

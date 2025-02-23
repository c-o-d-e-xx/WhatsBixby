const { getFilter, setFilter, deleteFilter } = require("../lib/db/filters");
const { Bixby } = require("../lib");

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
      const filters = await getFilter(message.jid);
      if (!filters) {
        return await message.reply("No filters are currently set in this chat.");
      }
      let response = "Your active filters for this chat:\n\n";
      filters.forEach((filter) => (response += `✒ ${filter.pattern}\n`));
      response += "Use: .filter keyword:message to set a filter";
      return await message.reply(response);
    }

    if (!text || !msg) {
      return await message.reply("```use : .filter keyword:message\nto set a filter```");
    }

    await setFilter(message.jid, text, msg, true);
    return await message.reply(`_Successfully set filter for ${text}_`);
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

    const deleted = await deleteFilter(message.jid, match);
    if (deleted) {
      await message.reply(`_Filter ${match} deleted_`);
    } else {
      await message.reply("No existing filter matches the provided input.");
    }
  }
);

Bixby(
  { on: "text", fromMe: false, dontAddCommandList: true },
  async (message, match) => {
    const filters = await getFilter(message.jid);
    if (!filters) return;

    filters.forEach(async (filter) => {
      const pattern = new RegExp(filter.regex ? filter.pattern : `\\b(${filter.pattern})\\b`, "gm");
      if (pattern.test(match)) {
        await message.reply(filter.text, { quoted: message });
      }
    });
  }
);
/*
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
      return  await message.reply(filter.dataValues.text, {
          quoted: message,
        });
      }
    });
  }
);
*/
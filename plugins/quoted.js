const { Bixby, isPrivate, serialize } = require("../lib/");
const { loadMessage } = require("../lib/db/StoreDb");

Bixby(
  {
    pattern: "quoted",
    fromMe: isPrivate,
    desc: "quoted message",
  },
  async (message, m, match) => {
    if (!message.reply_message && !match) {
      return await message.reply("*Reply to a message or provide ID*");
    }

    let key = await String(match || (message.reply_message && message.reply_message.key.id) || '').trim();
        if (!key) {
      return await message.reply("*No valid key found*");
    }

    let msg = await loadMessage(await key.trim());
    console.log("Key: '"+key+"'\n\n"+ await msg);

    if (msg) {

      msg = serialize(
        JSON.parse(JSON.stringify(await msg.message)),
        message.client
      );
      message.forward(message.jid, msg.message);
    }

    if (!msg) {
      return await message.reply(
        "_Message not found, maybe bot might not be running at that time_"
      );
    }

    msg = serialize(
      JSON.parse(JSON.stringify(await msg.message)),
      message.client
    );

    if (!msg.quoted || !msg.quoted.message) {
      return await message.reply("No quoted message found");
    }

    await message.forward(message.jid, msg.quoted.message);
  }
);
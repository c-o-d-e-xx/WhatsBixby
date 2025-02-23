const { Bixby, isPrivate } = require("../lib");
const { saveWarn, resetWarn, getWarns } = require("../lib/db/warn");
const { PausedChats, getPausedChats, savePausedChat, deleteAllPausedChats } = require("../lib/db/pausedchat");
const { WARN_COUNT } = require("../config");

Bixby(
  {
    pattern: "pp",
    fromMe: true,
    desc: "Set profile picture",
    type: "user",
  },
  async (message, match, m) => {
    if (!message.reply_message.image)
      return await message.reply("_Reply to a photo_");
    let buff = await m.quoted.download();
    await message.setPP(message.user, buff);
    return await message.reply("_Profile Picture Updated_");
  }
);

Bixby(
  {
    pattern: "fullpp",
    fromMe: true,  
    desc: "Set Full profilr picture",
    type: "user",
  },
  async (message, match, m) => {
    try{
    if (!message.reply_message.image)
      return await message.reply("_Reply to a photo_");
    let buff = await m.quoted.download();
    await message.SetFullPP(message.user , buff, message);
    return await message.reply("_Profile Picture Updated_");
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

Bixby(
  {
    pattern: "setname",
    fromMe: true,
    desc: "Set User name",
    type: "user",
  },
  async (message, match) => {
    if (!match) return await message.reply("_Enter name_");
    await message.updateName(match);
    return await message.reply(`_Username Updated : ${match}_`);
  }
);

Bixby(
  {
    pattern: "block",
    fromMe: true,
    desc: "Block a person",
    type: "user",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.block(jid);
      return await message.sendMessage(
        `_@${jid.split("@")[0]} Blocked_`,
        {
          mentions: [jid],
        }
      );
    } else {
      await message.block(message.jid);
      return await message.reply("_User blocked_");
    }
  }
);

Bixby(
  {
    pattern: "unblock",
    fromMe: true,
    desc: "Unblock a person",
    type: "user",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.block(jid);
      return await message.sendMessage(
        message.jid,
        `_@${jid.split("@")[0]} unblocked_`,
        {
          mentions: [jid],
        }
      );
    } else {
      await message.unblock(message.jid);
      return await message.reply("_User unblocked_");
    }
  }
);

Bixby(
  {
    pattern: "jid",
    fromMe: true,
    desc: "Give jid of chat/user",
    type: "user",
  },
  async (message, match) => {
    return await message.sendMessage(
      message.jid,
      message.mention[0] || message.reply_message.jid || message.jid
    );
  }
);

Bixby(
  {
    pattern: "dlt",
    fromMe: true,
    desc: "deletes a message",
    type: "user",
  },
  async (message, match, m, client) => {
    if (message.isGroup) {
      client.sendMessage(message.jid, { delete: message.reply_message.key });
    }
  }
);

Bixby(
  {
    pattern: "pause",
    fromMe: true,
    desc: "Pause the chat",
    dontAddCommandList: true,
  },
  async (message) => {
    const chatId = message.key.remoteJid;
    try {
      await savePausedChat(chatId);
      message.reply("Chat paused successfully.");
    } catch (error) {
      console.error(error);
      message.reply("Error pausing the chat.");
    }
  }
);

Bixby(
  {
    pattern: "resume",
    fromMe: true,
    desc: "Resume the paused chat",
    dontAddCommandList: true,
  },
  async (message) => {
    const chatId = message.key.remoteJid;

    try {
      const pausedChat = await PausedChats.findOne({ chatId });

      if (pausedChat) {
        await pausedChat.deleteOne();
        message.reply("Chat resumed successfully.");
      } else {
        message.reply("Chat is not paused.");
      }
    } catch (error) {
      console.error(error);
      message.reply("Error resuming the chat.");
    }
  }
);

Bixby(
  {
    pattern: "deleteallpaused",
    fromMe: true,
    desc: "Delete all paused chats",
    dontAddCommandList: true,
  },
  async (message) => {
    try {
      await deleteAllPausedChats();
      message.reply("All paused chats deleted successfully.");
    } catch (error) {
      console.error(error);
      message.reply("Error deleting all paused chats.");
    }
  }
);

Bixby(
  {
    pattern: "warn",
    fromMe: isPrivate,
    desc: "Warn a user",
  },
  async (message, match) => {
    const userId = message.mention[0] || message.reply_message?.jid;
    if (!userId) return message.reply("_Mention or reply to someone_");

    let reason = message?.reply_message?.text || match;
    reason = reason?.replace(/@(\d+)/, "");
    reason = reason?.trim() || "Reason not Provided";

    const warnInfo = await saveWarn(userId, reason);
    let userWarnCount = warnInfo ? warnInfo.warnCount : 0;

    await message.reply(
      `_User @${
        userId.split("@")[0]
      } warned._ \n_Warn Count: ${userWarnCount}._ \n_Reason: ${reason}_`,
      { mentions: [userId] }
    );

    if (userWarnCount > WARN_COUNT) {
      await message.sendMessage(
        message.jid,
        "Warn limit exceeded. Kicking user."
      );
      await message.client.groupParticipantsUpdate(
        message.jid,
        [userId],
        "remove"
      );
    }
  }
);

Bixby(
  {
    pattern: "resetwarn",
    fromMe: isPrivate,
    desc: "Reset warnings for a user",
  },
  async (message) => {
    const userId = message.mention[0] || message.reply_message?.jid;
    if (!userId) return message.reply("_Mention or reply to someone_");

    await resetWarn(userId);

    await message.reply(
      `_Warnings for @${userId.split("@")[0]} reset_`,
      {
        mentions: [userId],
      }
    );
  }
);
/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
  FiletypeFromUrl,
  parseJid,
  extractUrlFromMessage,
} = require("./functions");
const { getStatus, getMessage } = require("./db").Greetings;
const { UserBan, PDM } = require("./db")
const config = require("../config")
async function Greetings(data, conn) {
  pdmess(data, conn)
  const metadata = await conn.groupMetadata(data.id);
  const participants = data.participants;

  for (const user of participants) {
    const userpp = await getUserProfilePicture(conn, user);

    switch (data.action) {
      case "add": {
        banned(data, conn)
        await handleGroupAction(
          conn,
          data.id,
          metadata,
          user,
          userpp,
          "welcome"
        );
        break;
      }

      case "remove": {
        await handleGroupAction(
          conn,
          data.id,
          metadata,
          user,
          userpp,
          "goodbye"
        );
        break;
      }
    }


     
  }
}


async function banned(msg, conn) {
  let ChatId = msg.id
  var BannedIds = await UserBan.getUserBan(ChatId);
  if (!BannedIds) return;
  let sudoList = config.SUDO.split(',').map(Number);
  let zjid = await msg.participants[0]
  const id = msg.participants[0].split("@")[0];

  BannedIds.forEach(async (BanneUsers) => {
      if (BanneUsers === zjid) {
        if (!sudoList.includes(Number(id))) {
        console.log("Banned User");
         await conn.groupParticipantsUpdate(ChatId, [zjid], "remove");
         return await conn.sendMessage(ChatId, { text: "_Perma Banned User_"});
      } else {
        return await conn.sendMessage(ChatId, { text: "_Can't Remove Bot Admin (Banned From This Group)_"});
       }
    }
    });
   }

   async function pdmess(data, conn) {
    console.log(data)
    const PDMList = await PDM.getPDM();
    let res = PDMList.some(item => item.dataValues && item.dataValues.chatId === data.id);
      switch (data.action) {
            case "promote":
              {
                if(res) {
                console.log("promote")
                let author = await data.author
                let user = await data.participants[0]
                let text = `_@${author.split("@")[0]} *promoted* @${user.split("@")[0]}_`
                return conn.sendMessage(data.id, { text: text, mentions: parseJid(text) });
              }}
              break;
            case "demote":
              {
                if(res) {
                console.log("demote")
                let author = await data.author
                let user = await data.participants[0]
                let text = `_@${author.split("@")[0]} *demoted* @${user.split("@")[0]}_`
                return conn.sendMessage(data.id, { text: text, mentions: parseJid(text) });
              }}
              break;
    }
  }

async function getUserProfilePicture(conn, user) {
  try {
    return await conn.profilePictureUrl(user, "image");
  } catch {
    return "https://github.com/Alien-Alfa/Alien-alfa/blob/beta/noimg.png?raw=true";
  }
}

async function handleGroupAction(
  conn,
  groupId,
  metadata,
  user,
  userpp,
  actionType
) {
  const status = await getStatus(groupId, actionType);
  if (!status) return;

  const message = await getMessage(groupId, actionType);
  let msg = replaceMessagePlaceholders(message.message, user, metadata);

  const url = extractUrlFromMessage(msg);

  if (url) {
    const { type, buffer } = await FiletypeFromUrl(url);

    if (type === "image" || type === "video") {
      const caption = msg.replace(url, "").trim();

      conn.sendMessage(groupId, {
        [type]: buffer,
        caption,
        mentions: parseJid(msg),
      });
    } else {
      conn.sendMessage(groupId, { text: msg, mentions: parseJid(msg) });
    }
  } else {
    conn.sendMessage(groupId, { text: msg, mentions: parseJid(msg) });
  }
}

function replaceMessagePlaceholders(message, user, metadata) {
  return message
    .replace(/@user/gi, `@${user.split("@")[0]}`)
    .replace(/@gname/gi, metadata.subject)
    .replace(/@count/gi, metadata.participants.length);
}

module.exports = Greetings;

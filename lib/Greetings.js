const {
  FiletypeFromUrl,
  parseJid,
  extractUrlFromMessage,
} = require("./function");
const { getGreetStatus, getGreet, UserBan, getUserBan, getPDM } = require("./db");
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
  const ChatId = msg.id;
  const BannedIds = await getUserBan(ChatId);
  if (!BannedIds) return;

  const sudoList = config.SUDO.split(',').map(Number);
  
  for (const participant of msg.participants) {
    try {
      const zjid = participant;
      const id = Number(zjid.split('@')[0]);

      if (BannedIds.includes(zjid)) {
        if (!sudoList.includes(id)) {
          console.log("Removing Banned User:", zjid);
          await conn.groupParticipantsUpdate(ChatId, [zjid], "remove");
          await conn.sendMessage(ChatId, { text: "_Perma Banned User_" });
        } else {
          await conn.sendMessage(ChatId, { 
            text: "_Can't Remove Bot Admin (Banned From This Group)_" 
          });
        }
      }
    } catch (error) {
      console.error("Error processing participant:", error);
    }
  }
}

   async function pdmess(data, conn) {
  console.log(data);

  const PDMList = await getPDM();

  let res = PDMList.some(item => item.chatId === data.id);

  switch (data.action) {
    case "promote":
      if (res) {
        console.log("promote");
        let author = await data.author;
        let user = await data.participants[0];
        let text = `_@${author.split("@")[0]} *promoted* @${user.split("@")[0]}_`;
        return conn.sendMessage(data.id, { text: text, mentions: parseJid(text) });
      }
      break;

    case "demote":
      if (res) {
        console.log("demote");
        let author = await data.author;
        let user = await data.participants[0];
        let text = `_@${author.split("@")[0]} *demoted* @${user.split("@")[0]}_`;
        return conn.sendMessage(data.id, { text: text, mentions: parseJid(text) });
      }
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
  const status = await getGreetStatus(groupId, actionType);
  if (!status) return;

  const message = await getGreet(groupId, actionType);
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

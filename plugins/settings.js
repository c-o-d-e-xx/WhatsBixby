/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
  Bixby,
  isAdmin,
  parsedJid,
  isPrivate,
  getBuffer,
  fromMe
} = require("../lib");
const {
  callAction,
  PDM,
  React,
  stickban,
  UserBan,
  banbot,
  GroupDB,
  AiChat
} = require("../lib/db");
const config = require("../config");
const {
  delay
} = require("@whiskeysockets/baileys");
const axios = require("axios");


async function getUserProfilePicture(message, user) {
  try {
     return await message.client.profilePictureUrl(user, "image");
  }
  catch {
     return "false";
  }
}

function formatDate(inputDate) {
  // Parse the input date string
  const date = new Date(inputDate);

  // Extract date components
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, '0');

  // Extract time components
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  // Construct the formatted date string
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}


Bixby({
     pattern: "snapshot",
     fromMe: isPrivate,
     desc: "Save a snapshot of the Group setings",
  },
  async (message, match) => {
   console.log("'"+match+"'")
     const {
        key
     } = await message.reply("_Procesing that request!_");
     let isyouadmin = await isAdmin(message.jid, message.key.participant, message.client);
     if (!isyouadmin) return;
     const ismeadmin = await isAdmin(message.jid, message.user, message.client);
     if (!ismeadmin) return await message.client.sendMessage(message.jid, { text: "_I'm not admin_", edit: key });

     const SnapShots = await GroupDB.getSnapshot(message.jid);

     try {
        if (match === " new") {
           return await saveNewData()
        }
        else if (match === " restore") {
           return await RestoreData()
        }
        else if (match === " -help") {
           return await message.client.sendMessage(message.jid, {
              text: `*Info*\nThis command will Save the current Metadata To database.
*Tags*
- New : makes new Snapshot
- restore : Restores the Saved Snapshot (Group name, Description, Profile Pic)
- restore full : Restores the Group including admins and members.
- -help : Shows the information of this command`,
              edit: key
           });
        } else {
           //============================================================================================================================================================
           //========================== Get values ==========================

           if (SnapShots) {

              let cal = await extract()
              const {
                 ProfilePic,
                 createdAt,
                 subject,
                 size,
                 desc,
                 restrict,
                 announce,
                 participants
              } = cal;
              const participantsArray = participants;

              var adminList = [];
              var participantList = [];
              var n = 1
              // Loop through the data
              for (var i = 0; i < participantsArray.length; i++) {
                 var entry = participantsArray[i];
                 if (entry.admin === 'admin') {
                    adminList.push(`      •` + entry.id.split("@")[0]);
                 }
                 else {
                    participantList.push(`      •` + entry.id.split("@")[0]);
                 }
              }

              var adminListz = adminList.join("\n");

              let pfpp;
              if (ProfilePic) {
                 pfpp = "[Saved]"
              }
              else {
                 pfpp = "[No Profile Pic]"
              }


              let texax = `You Already have a snapshot of this Group from:\n ${ await formatDate(createdAt)}\n\n
Saved Values:
- ProfilePic: ${pfpp}
- Subjest: ${subject}
- Restricted: ${restrict}
- Anounce: ${announce}
- Size: ${size}
- Admins: \n${adminListz}
- Description: ${desc}`
              const jid = parsedJid(texax);

              return await message.client.sendMessage(message.jid, {
                 text: texax,
                 edit: key
              },{
               mentions: [jid],
             });

           }
           //====================================================================
           //============================================================================================================================================================
           if (!SnapShots) {
              saveNewData()
           }
        }

        async function extract() {
           try {
              var groupSnapshot = SnapShots[0];
              const {
                 chat,
                 ProfilePic,
                 metaData,
                 createdAt
              } = groupSnapshot.dataValues;
              const parsedMetaData = JSON.parse(metaData);
              const {
                 id,
                 subject,
                 subjectOwner,
                 subjectTime,
                 size,
                 creation,
                 owner,
                 desc,
                 descId,
                 linkedParent,
                 restrict,
                 announce,
                 isCommunity,
                 isCommunityAnnounce,
                 joinApprovalMode,
                 memberAddMode,
                 participants
              } = parsedMetaData;
              const participantsArray = parsedMetaData.participants;
              const jsonResponse = {
                 chat,
                 ProfilePic,
                 id,
                 subject,
                 subjectOwner,
                 subjectTime,
                 size,
                 creation,
                 owner,
                 desc,
                 descId,
                 linkedParent,
                 restrict,
                 announce,
                 isCommunity,
                 isCommunityAnnounce,
                 joinApprovalMode,
                 memberAddMode,
                 participants: participantsArray,
                 createdAt
              };
              return jsonResponse;
           }
           catch (err) {
              console.log("[Snap Save Error]:" + err);
              return JSON.stringify({
                 error: err.message
              });
           }
        }

        async function RestoreData() {
           try {
              let {
                 chat,
                 ProfilePic,
                 id,
                 subject,
                 subjectOwner,
                 subjectTime,
                 size,
                 creation,
                 owner,
                 desc,
                 descId,
                 linkedParent,
                 restrict,
                 announce,
                 isCommunity,
                 isCommunityAnnounce,
                 joinApprovalMode,
                 memberAddMode,
                 participants,
                 createdAt
              } = await extract()
              delay(1000)
              if (ProfilePic === "false") {
                 message.client.removeProfilePicture(chat);
                 await message.client.sendMessage(message.jid, {
                    text: `Profile picture Restored!`,
                    edit: key
                 });
              }
              else {
                 let buff = await getBuffer(ProfilePic)

                 message.setPP(chat, buff);
                 await message.client.sendMessage(message.jid, {
                    text: `Profile picture Restored!`,
                    edit: key
                 });
              }
              delay(1000)
              message.client.groupUpdateSubject(chat, subject)
              await message.client.sendMessage(message.jid, {
                 text: `Group Name Restored!`,
                 edit: key
              });
              delay(1000)
              message.client.groupUpdateDescription(chat, desc)
              await message.client.sendMessage(message.jid, {
                 text: `Group Description Restored!`,
                 edit: key
              });
              delay(1000)
              let announcement;
              if (announce === true) {
                 announcement = "announcement"
              }
              else {
                 announcement = "not_announcement"
              }
              message.client.groupSettingUpdate(chat, announcement)
              await message.client.sendMessage(message.jid, {
                 text: `Group Announcement settings Restored!`,
                 edit: key
              });
              delay(1000)
              let lock;
              if (restrict === true) {
                 lock = "unlocked"
              }
              else {
                 lock = "locked"
              }
              message.client.groupSettingUpdate(chat, lock)
              await message.client.sendMessage(message.jid, {
                 text: `Group Editing settings Restored!`,
                 edit: key
              });
              delay(2000)
              return await message.client.sendMessage(message.jid, {
                 text: `Group Restored!`,
                 edit: key
              });

           }
           catch (err) {
              console.log("[Snap Save Error]:" + err);
              return JSON.stringify({
                 error: err.message
              });
           }
        }


        async function saveNewData() {
           try {
              const MetaData = await message.client.groupMetadata(message.jid);
              const pp = await getUserProfilePicture(message, message.jid);

              const ppfile = await getBuffer(pp)
              const response = await axios.post("http://paste.c-net.org/", ppfile, {
               headers: { "Content-Type": "image/jpeg" },
            });

              let metaData = JSON.stringify(MetaData);
              let res = await GroupDB.setSnapshot(message.jid, response, metaData)
              if (!res) return
              let pfpp;
              if (pp === "false") {
                 pfpp = "[NO PROFILE PIC]"
              }
              else {
                 pfpp = "[SAVED]"
              }
              return await message.client.sendMessage(message.jid, {
                 text: `New data saved!\n
Saved:
- Picture: ${pfpp}
- MetaData: [Metadata]`,
                 edit: key
              });
           }
           catch (err) {
              console.log("[Snap Save Error]:" + err)
           }

        }


     }
     catch (error) {
        console.error(error);
        return message.reply("_Error activating Bot Banning!_");
     }


  });
Bixby({
     pattern: "settings",
     fromMe: true,
     desc: "Show All Additional Settings",
  },
  async (message, match) => {

     try {

        let mess = `│╭──[ *Settings* ]──㋰

││ *callblock* : Activate or Deactivate call Blocking for the current chat

││ *pdm* : Activate or Deactivate Group update notification for the current Group

││ *banbot* : Activate or Deactivate Detection and removal of other bots for the current group *Bot Must Be ADMIN*

││ *#ban* : Ban a user permanently from the current group (if the user try to join bot will remove him instantly *Bot Must Be ADMIN* )

││ *#Unban* : Release the user from banned list and add him back *Bot Must Be ADMIN*

││ *stickban* : Ban a Sticker from the current group (if the user try to send the sane sticker bot will remove him instantly *Bot Must Be ADMIN* )

││ *stickunban* : Release the sticker from banned list *Bot Must Be ADMIN*

││ *snapshot* : Saves the current metadata of the group and can be used to restore the group with the saved data later *bot must be admin*

│╰──㋰\n`.toUpperCase()

        return message.reply(mess);

     }
     catch (error) {
        console.error(error);
        return message.reply("_Error Deactivating Call Blocking!_");
     }

  });

Bixby({
     pattern: "pdm",
     fromMe: isPrivate,
     desc: "Promote Demote Messages",
     dontAddCommandList: true,
  },
  async (message, match) => {
     const chatId = message.key.remoteJid;
     try {
        if (!message.isGroup) return; // await message.reply("_This command is for groups_");

        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return
        const PDMlist = await PDM.PDM.findOne({
           where: {
              chatId
           },
        });
        if (!PDMlist) {
           await PDM.savePDM(chatId);
           return message.reply("_PDM Activated!_");
        }
        else if (PDMlist) {
           await PDMlist.destroy();
           return message.reply("_PDM Deactivated!_");
        }
        else {
           return message.reply("_Error!_");
        }
     }
     catch (error) {
        console.error(error);
        return message.reply("_Error activating PDM!_");
     }

  });

  Bixby({
   pattern: "autoreact",
   fromMe: isPrivate,
   desc: "Promote Demote Messages",
   dontAddCommandList: true,
},
async (message, match) => {

   let chatId;
   if (match && match.includes("@g.us")) {
      chatId = match.split(' ').filter(word => word.includes("@g.us"));
   } else {
      chatId = message.key.remoteJid;
   }


   try {
      const Reactlist = await React.React.findOne({
         where: {
            chatId
         },
      });
      if (!Reactlist) {
         await React.saveReact(chatId);
         return message.reply("_Auto React Activated!_");
      }
      else if (Reactlist) {
         await Reactlist.destroy();
         return message.reply("_Auto React Deactivated!_");
      }
      else {
         return message.reply("_Error!_");
      }
   }
   catch (error) {
      console.error(error);
      return message.reply("_Error activating Auto React!_");
   }

});

Bixby({
     pattern: "banbot",
     fromMe: isPrivate,
     desc: "Ban other Bots in group",
     dontAddCommandList: true,
  },
  async (message, match) => {
     const chatId = message.key.remoteJid;
     try {
        if (!message.isGroup) return;
        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return
        const banbotlist = await banbot.banbot.findOne({
           where: {
              chatId
           },
        });
        if (!banbotlist) {
           await banbot.savebanbot(chatId);
           return message.reply("_Bot Banning Activated!_");
        }
        else if (banbotlist) {
           await banbotlist.destroy();
           return message.reply("_Bot Banning Deactivated!_");
        }
        else {
           return message.reply("_Error!_");
        }
     }
     catch (error) {
        console.error(error);
        return message.reply("_Error activating Bot Banning!_");
     }

  });

Bixby({
     on: "message",
     fromMe: false,
     dontAddCommandList: true
  },
  async (message, match) => {
     let aurora = message.text ? message.text.includes("Bot Detected!") : false
     if (aurora) return;
     const chatId = message.key.remoteJid;
     const banbotlist = await banbot.banbot.findOne({
        where: {
           chatId
        }
     });
     if (banbotlist) {
        console.log(message.isBaileys)
        if (message.isBaileys) {
           let {
              key
           } = await message.reply("*_Bot Detected!_*")
           let isyouadmin = await isAdmin(message.jid, message.key.participant, message.client);
           if (isyouadmin) return await message.client.sendMessage(message.jid, {
              text: "_Verified Admin!_",
              edit: key
           });
           const ismeadmin = await isAdmin(message.jid, message.user, message.client);
           if (!ismeadmin) return;
           const zjid = message.key.participant;
           const jid = parsedJid(zjid);
           delay(500)
           await message.client.groupParticipantsUpdate(message.jid, jid, "remove");

           return await message.client.sendMessage(message.jid, {
              text: `_@${jid[0].split("@")[0]} kicked for using Bot_`,
              edit: key
           }, {
              mentions: [jid],
           });
        }
     }
  });


Bixby({
     on: "message",
     fromMe: false,
     dontAddCommandList: true
  },
  async (message, match) => {
     if (!message.sticker) return;
     let mediakey = message.sticker.mediaKey;
     const chatId = message.key.remoteJid;
     const BannIds = await stickban.getStickBan(chatId);
     if (!BannIds) return;
     console.log(BannIds)
     let sudoList = config.SUDO.split(',').map(Number);
     const zjid = message.key.participant;
     const id = message.key.participant.split("@")[0];
     BannIds.forEach(async (BanneUsers) => {
        if (BanneUsers === mediakey) {
           if (!sudoList.includes(Number(id))) {
              console.log("Banned Sticker");
              await message.client.sendMessage(chatId, {
                 text: "_Banned Sticker_"
              });
              delay(500)
              await message.client.groupParticipantsUpdate(chatId, [zjid], "remove");
              return await message.client.sendMessage(chatId, {
                 delete: message.key
              })


           }
           else {
              return await message.client.sendMessage(chatId, {
                 text: "_Sudo user is using Banned Sticker_"
              });
           }
        }


     });
  });


Bixby({
     pattern: "callblock",
     fromMe: true,
     desc: "Call blocking",
     dontAddCommandList: true,
  },
  async (message, match) => {
     const chatId = message.key.remoteJid;

     try {
        const Calllist = await callAction.call.findOne({
           where: {
              chatId
           },
        });
        if (!Calllist) {
           await callAction.savecall(chatId);
           return message.reply("_Call Blocking Deactivated!_");
        }
        else if (Calllist) {
           await Calllist.destroy();
           return message.reply("_Call Blocking Activated!_");
        }
        else {
           return message.reply("_Error!_");
        }

     }
     catch (error) {
        console.error(error);
        return message.reply("_Error Deactivating Call Blocking!_");
     }

  });

Bixby(

  {
     pattern: "#ban",
     fromMe: isPrivate,
     desc: "Ban a sticker in group",
  },
  async (message, match) => {
     try {
        if (!message.isGroup) return; // await message.reply("_This command is for groups_");


        match = match || message.reply_message.jid;

        let me = await fromMe(message.participant)
        let key;
        if (me) {
           key = await message.key;
        }
        else {
           ({
              key
           } = await message.reply("_Processing That Request!_"));
        }
        match = match || message.reply_message.jid;
        if (!match) return await message.client.sendMessage(message.jid, {
           text: "_Mention user to Ban!_",
           edit: key
        });
        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return await message.client.sendMessage(message.jid, {
           text: "_You're not admin!_",
           edit: key
        });
        let ismeadmin = await isAdmin(message.jid, message.user, message.client);
        if (!ismeadmin) return await message.client.sendMessage(message.jid, {
           text: "_I'm not admin!_",
           edit: key
        });
        let jid = parsedJid(match);
        add = await UserBan.saveUserBan(message.jid, jid[0]);

        if (!add) {
           await message.reply("_User is already Banned!_");
        }
        else {
           setTimeout(async () => {
              await message.kick(jid);
           }, 1000)
           return await message.client.sendMessage(message.jid, {
              text: `_User is Permenently Banned From This Group!_`,
              edit: key
           });
        }
     }
     catch (error) {
        console.error("[Error]:", error);
     }

  }
);


Bixby({
     pattern: "#unban",
     fromMe: isPrivate,
     desc: "Unban a sticker in group",
  },
  async (message, match) => {
     try {
        if (!message.isGroup) return; // await message.reply("_This command is for groups_");

        match = match || message.reply_message.jid;

        let me = await fromMe(message.participant)
        let key;
        if (me) {
           key = await message.key;
        }
        else {
           ({
              key
           } = await message.reply("_Processing That Request!_"));
        }
        match = match || message.reply_message.jid;
        if (!match) return await message.client.sendMessage(message.jid, {
           text: "_Mention user to Unban!_",
           edit: key
        });
        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return await message.client.sendMessage(message.jid, {
           text: "_You're not admin!_",
           edit: key
        });
        let ismeadmin = await isAdmin(message.jid, message.user, message.client);
        if (!ismeadmin) return await message.client.sendMessage(message.jid, {
           text: "_I'm not admin!_",
           edit: key
        });
        let jid = parsedJid(match);
        del = await UserBan.deleteUserBan(message.jid, jid[0]);
        if (!del) {
           await message.reply("_User is not Banned!_");
        }
        else {
           setTimeout(async () => {
              return await message.client.sendMessage(message.jid, {
                 text: `_User is Unbanned For This Group!_`,
                 edit: key
              });
           }, 1000)
           await message.add(jid);

        }
     }
     catch (error) {
        console.error("[Error]:", error);
     }

  }
);


Bixby(

  {
     pattern: "stickban",
     fromMe: isPrivate,
     desc: "Ban a sticker in group",
  },
  async (message, match) => {
     try {
        if (match === " list") {
           const chatId = message.key.remoteJid;
           const BannIds = await stickban.getStickBan(chatId);
           if (!BannIds) return await message.reply("_No Stickers are Banned_");
           let mggs = `*Banned Sticker ID:*\n`;
           BannIds.forEach(async (BanneUsers) => {
              mggs += "- " + BanneUsers + "\n"
           });
           return await message.reply(mggs);

        }
        else if (!message.reply_message.sticker) return await message.reply("_Reply to sticker_");
        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return
        const StickId = await message.reply_message.sticker.mediaKey
        // console.log( await StickId)
        await stickban.saveStickBan(message.jid, StickId);
        return await message.reply(`_Sticker Banned successfully._`);
     }
     catch (error) {
        console.error("[Error]:", error);
     }

  }
);


Bixby({
     pattern: "stickunban",
     fromMe: isPrivate,
     desc: "Unban a sticker in group",
  },
  async (message, match) => {
     try {
        if (!message.reply_message && !message.reply_message.sticker)
           return await message.reply("_Reply to sticker_");
        let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
        if (!isadmin) return
        const StickId = message.reply_message.sticker.mediaKey

        del = await stickban.deleteStickBan(message.jid, StickId);

        if (!del) {
           await message.reply("_Sticker is not Banned._");
        }
        else {
           await message.reply(`_Sticker Unbanned successfully._`);
        }
     }
     catch (error) {
        console.error("[Error]:", error);
     }

  }
);


Bixby({
   pattern: "aichat",
   fromMe: isPrivate,
   desc: "Activates ai aurora on this chat",
   dontAddCommandList: true,
},
async (message, match) => {
   const chatId = message.key.remoteJid;
   try {
      if (message.isGroup){
      let isadmin = await isAdmin(message.jid, message.key.participant, message.client);
      if (!isadmin) return
      }
      const ChatList = await AiChat.Ai.findOne({
         where: {
            chatId
         },
      });
      if (!ChatList) {
         await AiChat.saveAi(chatId);
         return message.reply("_AI Chat Activated!_");
      }
      else if (ChatList) {
         await ChatList.destroy();
         return message.reply("_Ai Chat Deactivated!_");
      }
      else {
         return message.reply("_Error!_");
      }
   }
   catch (error) {
      console.error(error);
      return message.reply("_Error activating Ai Chat!_");
   }

});

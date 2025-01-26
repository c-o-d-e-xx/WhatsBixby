/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require("../../config");
const { DataTypes } = require("sequelize");

const UserBan = config.DATABASE.define("UserBan", {
  chatid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bannedid: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});


async function getchatid() {
  try {
    const allchatids = await SettingsDB.findAll();

    if (allchatids.length < 1) {
      return false;
    } else {
      return allchatids;
    }
  } catch (error) {
    console.error("Error fetching chatidurations:", error);
    return false;
  }
}

async function getUserBan(jid = null) {

  var Where = { chatid: jid };
  var Msg = await UserBan.findAll({
    where: Where,
  });

  if (Msg.length < 1) {
    return null;
  } else {
    // Assuming UserBan model has a property named "bannedid"
    return Msg.map(item => item.bannedid);
  }
}

async function saveUserBan(jid = null, bannedid = null) {
  var Msg = await UserBan.findAll({
    where: {
      chatid: jid,
      bannedid: bannedid,
    },
  });

  if (Msg.length < 1) {
    return await UserBan.create({
      chatid: jid,
      bannedid: bannedid,
    });
  } else {
    return await Msg[0].update({
      chatid: jid,
      bannedid: bannedid,
    });
  }
}

async function deleteUserBan(jid = null, bannedid) {
  var Msg = await UserBan.findAll({
    where: {
      chatid: jid,
      bannedid: bannedid,
    },
  });
  if (Msg.length < 1) {
    return false;
  } else {
    return await Msg[0].destroy();
  }
}

module.exports = {
  UserBan: UserBan,
  getUserBan: getUserBan,
  saveUserBan: saveUserBan,
  deleteUserBan: deleteUserBan,
};

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

/*const config = require("../../config");
const { DataTypes } = require("sequelize");

const GroupDB = config.DATABASE.define("GroupSnapshot", {
  chat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Gprofile: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  admins: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  restrict: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  announce: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  size: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

async function getSnapshot(jid = null) {

  var Where = { chat: jid };
  var Msg = await GroupDB.findAll({
    where: Where,
  });

  if (Msg.length < 1) {
    return null;
  } else {
    return Msg
  }
}
async function setSnapshot(jid = null, pfp = null, gsub = null, gdesc = null, gadmins = null, grestr = null, ganounce = null, gsize = null, gdate = null) {
  // Check if a snapshot with the provided jid exists
  let existingSnapshot = await GroupDB.findOne({
    where: {
      chat: jid
    }
  });

  if (existingSnapshot) {
    // Update existing snapshot
    await existingSnapshot.update({
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate
    });
    return existingSnapshot;
  } else {
    // Create new snapshot
    return await GroupDB.create({
      chat: jid,
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate
    });
  }
  
}


async function saveSnapshot(jid = null, pfp = null, gsub = null, gdesc = null, gadmins = null, grestr = null, ganounce = null, gsize = null, gdate = null) {
  const existingSnapshot = await GroupDB.findOne({
    where: {
      chat: jid,
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate,
       },
  });

  if (!existingSnapshot) {
    return await GroupDB.create({
      chat: jid,
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate,
    });
  } else {
    return await existingSnapshot.update({
      chat: jid,
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate,
    });
  }
}

async function deleteSnapshot(jid = null) {
  const existingSnapshot = await GroupDB.findOne({
    where: {
      chat: jid,
      Gprofile: pfp,
      subject: gsub,
      desc: gdesc,
      admins: gadmins,
      restrict: grestr,
      announce: ganounce,
      size: gsize,
      date: gdate,
    },
  });

  if (!existingSnapshot) {
    return false;
  } else {
    return await existingSnapshot.destroy();
  }
}

module.exports = {
  GroupDB,
  getSnapshot,
  setSnapshot,
  deleteSnapshot,
};
*/
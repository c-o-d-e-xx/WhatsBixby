/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require("../../config");
const { DataTypes } = require("sequelize");

const GroupDB = config.DATABASE.define("GroupSnapshot", {
  chat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ProfilePic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  metaData: { 
    type: DataTypes.STRING,
    allowNull: false,
  }
});

async function getSnapshot(jid = null) {
  if (!jid) return null; 

  const snapshot = await GroupDB.findAll({
    where: { chat: jid },
  });

  return snapshot.length > 0 ? snapshot : null;
}

async function setSnapshot(jid = null, pfp = null, metadata = null) {
  if (!jid || !pfp || !metadata) return null; 

  let existingSnapshot = await GroupDB.findOne({
    where: { chat: jid },
  });

  if (existingSnapshot) {
    try {
      await existingSnapshot.update({
        ProfilePic: pfp,
        metaData: metadata, 
      });
      return existingSnapshot;
    } catch (error) {
      console.error("Error updating snapshot:", error);
      return null; 
    }
  } else {
    try {
      return await GroupDB.create({
        chat: jid,
        ProfilePic: pfp,
        metaData: metadata, 
      });
    } catch (error) {
      console.error("Error creating snapshot:", error);
      return null; 
    }
  }
}

async function deleteSnapshot(jid = null) {
  if (!jid) return null; 

  const existingSnapshot = await GroupDB.findOne({
    where: { chat: jid },
  });

  if (!existingSnapshot) return null; 

  try {
    await existingSnapshot.destroy();
    return true; 
  } catch (error) {
    console.error("Error deleting snapshot:", error);
    return false; 
  }
}

module.exports = {
  GroupDB,
  getSnapshot,
  setSnapshot,
  deleteSnapshot,
};

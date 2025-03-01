const mongoose = require('mongoose');

const stickBanSchema = new mongoose.Schema({
  chat: {
    type: String,
    required: true,
  },
  stickid: {
    type: String,
    required: true,
  },
});

const StickBan = mongoose.model('StickBan', stickBanSchema);

async function getConfig() {
  try {
    const allConfigs = await SettingsDB.find();

    if (allConfigs.length < 1) {
      return false;
    } else {
      return allConfigs;
    }
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return false;
  }
}

async function getStickBan(jid = null) {
  try {
    const stickBans = await StickBan.find({ chat: jid });

    if (stickBans.length < 1) {
      return null;
    } else {
      return stickBans.map(item => item.stickid);
    }
  } catch (error) {
    console.error("Error fetching stick bans:", error);
    return null;
  }
}

async function saveStickBan(jid = null, stickid = null) {
  try {
    const existingStickBan = await StickBan.findOne({ chat: jid, stickid: stickid });

    if (!existingStickBan) {
      const newStickBan = new StickBan({
        chat: jid,
        stickid: stickid,
      });
      return await newStickBan.save();
    } else {
      existingStickBan.stickid = stickid;
      return await existingStickBan.save();
    }
  } catch (error) {
    console.error("Error saving stick ban:", error);
    return false;
  }
}

async function deleteStickBan(jid = null, stickid) {
  try {
    const existingStickBan = await StickBan.findOne({ chat: jid, stickid: stickid });

    if (!existingStickBan) {
      return false;
    } else {
      return await existingStickBan.remove();
    }
  } catch (error) {
    console.error("Error deleting stick ban:", error);
    return false;
  }
}

module.exports = {
  StickBan,
  getStickBan,
  saveStickBan,
  deleteStickBan,
};
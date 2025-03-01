const mongoose = require("mongoose");

const UserBanSchema = new mongoose.Schema({
  chatid: {
    type: String,
    required: true,
  },
  bannedid: {
    type: String,
    required: true,
  },
});

const UserBan = mongoose.model("UserBan", UserBanSchema);

async function getchatid() {
  try {
    const allchatids = await UserBan.find({});

    if (allchatids.length < 1) {
      return false;
    } else {
      return allchatids;
    }
  } catch (error) {
    console.error("Error fetching chat IDs:", error);
    return false;
  }
}

async function getUserBan(jid = null) {
  try {
    const bannedUsers = await UserBan.find({ chatid: jid });

    if (bannedUsers.length < 1) {
      return null;
    } else {
      return bannedUsers.map((item) => item.bannedid);
    }
  } catch (error) {
    console.error("Error fetching banned users:", error);
    return null;
  }
}

async function saveUserBan(jid = null, bannedid = null) {
  try {
    const existingBan = await UserBan.findOne({ chatid: jid, bannedid: bannedid });

    if (!existingBan) {
      const newBan = new UserBan({
        chatid: jid,
        bannedid: bannedid,
      });
      return await newBan.save();
    } else {
      return existingBan;
    }
  } catch (error) {
    console.error("Error saving banned user:", error);
    return false;
  }
}

async function deleteUserBan(jid = null, bannedid = null) {
  try {
    const deletedBan = await UserBan.findOneAndDelete({ chatid: jid, bannedid: bannedid });

    if (!deletedBan) {
      return false;
    } else {
      return deletedBan;
    }
  } catch (error) {
    console.error("Error deleting banned user:", error);
    return false;
  }
}

module.exports = {
  UserBan,
  getUserBan,
  saveUserBan,
  deleteUserBan,
};
const mongoose = require('mongoose');

const banbotSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  }
});

const Banbot = mongoose.model('Banbot', banbotSchema);

async function getbanbot() {
  return await Banbot.find({});
}

async function savebanbot(chatId) {
  const newBanbot = new Banbot({ chatId });
  return await newBanbot.save();
}

async function deleteAllbanbot() {
  return await Banbot.deleteMany({});
}

async function getBanBotStatus(chatId) {
  const banbotlist = await Banbot.findOne({ chatId });
  return banbotlist ? "enabled" : "disabled";
}

async function setBanBotStatus(chatId, status) {
  if (status === "enabled") {
    await savebanbot(chatId);
  } else if (status === "disabled") {
    await Banbot.deleteOne({ chatId });
  }
}

module.exports = {
  Banbot,
  getbanbot,
  savebanbot,
  deleteAllbanbot,
  getBanBotStatus,
  setBanBotStatus,
};
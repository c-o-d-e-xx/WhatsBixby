const mongoose = require("mongoose");

const PausedChatsSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
});

const PausedChats = mongoose.model("PausedChats", PausedChatsSchema);

async function getPausedChats() {
  return await PausedChats.find();
}

async function savePausedChat(chatId) {
  return await PausedChats.create({ chatId });
}

async function deleteAllPausedChats() {
  return await PausedChats.deleteMany({});
}

module.exports = {
  PausedChats,
  getPausedChats,
  savePausedChat,
  deleteAllPausedChats,
};
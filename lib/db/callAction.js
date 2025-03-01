const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
});

const Call = mongoose.model("Call", CallSchema);

async function getcall() {
  return await Call.find();
}

async function savecall(chatId) {
  return await Call.create({ chatId });
}

async function deletecall(chatId) {
  return await Call.deleteOne({ chatId });
}

async function deleteAllcall() {
  return await Call.deleteMany({});
}

async function isCallBlocked(chatId) {
  const call = await Call.findOne({ chatId });
  return call !== null;
}

async function getTotalBlockedChats() {
  return await Call.countDocuments();
}

async function enableCallBlockForAll() {
  return await Call.create({ chatId: "all" });
}

async function disableCallBlockForAll() {
  return await Call.deleteOne({ chatId: "all" });
}

async function isCallBlockEnabledForAll() {
  const call = await Call.findOne({ chatId: "all" });
  return call !== null;
}

module.exports = {
  Call,
  getcall,
  savecall,
  deletecall,
  deleteAllcall,
  isCallBlocked,
  getTotalBlockedChats,
  enableCallBlockForAll,
  disableCallBlockForAll,
  isCallBlockEnabledForAll,
};
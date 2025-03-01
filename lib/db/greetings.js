const mongoose = require("mongoose");

const GreetingsSchema = new mongoose.Schema({
  chat: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

const GreetingsDB = mongoose.model("Greetings", GreetingsSchema);

async function getGreet(jid = null, type = null) {
  const message = await GreetingsDB.findOne({ chat: jid, type });
  return message ? message : false;
}

async function setGreet(jid = null, type = null, text = null) {
  const existingMessage = await GreetingsDB.findOne({ chat: jid, type });

  if (!existingMessage) {
    return await GreetingsDB.create({
      chat: jid,
      message: text,
      type,
      status: true,
    });
  } else {
    return await existingMessage.updateOne({ chat: jid, message: text });
  }
}

async function delGreet(jid = null, type = null) {
  const existingMessage = await GreetingsDB.findOne({ chat: jid, type });

  if (existingMessage) {
    await existingMessage.deleteOne();
  }
}

async function setGreetStatus(jid = null, type = null) {
  const existingMessage = await GreetingsDB.findOne({ chat: jid, type });

  if (!existingMessage) {
    return false;
  } else {
    const newStatus = !existingMessage.status;
    return await existingMessage.updateOne({ chat: jid, status: newStatus });
  }
}

async function getGreetStatus(jid = null, type = null) {
  try {
    const existingMessage = await GreetingsDB.findOne({ chat: jid, type });
    return existingMessage ? existingMessage.status : false;
  } catch {
    return false;
  }
}

module.exports = {
  GreetingsDB,
  setGreet,
  getGreet,
  delGreet,
  setGreetStatus,
  getGreetStatus,
};
const { isJidGroup } = require("@whiskeysockets/baileys");
const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conversationTimestamp: { type: Number, required: true },
  isGroup: { type: Boolean, required: true },
});

const Chat = mongoose.model("Chat", ChatSchema);

const MessageSchema = new mongoose.Schema({
  jid: { type: String, required: true },
  message: { type: Object, required: true },
  id: { type: String, required: true, unique: true },
});

const Message = mongoose.model("Message", MessageSchema);

const ContactSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const Contact = mongoose.model("Contact", ContactSchema);

const saveContact = async (jid, name) => {
  try {
    if (!jid || !name || isJidGroup(jid)) return;

    const exists = await Contact.findOne({ jid });
    if (exists) {
      if (exists.name !== name) {
        await Contact.updateOne({ jid }, { name });
      }
    } else {
      await Contact.create({ jid, name });
    }
  } catch (e) {
    console.error(e);
  }
};

const saveMessage = async (message, user) => {
  try {
    const jid = message.key.remoteJid;
    const id = message.key.id;
    if (!id || !jid || !message) return;

    await saveContact(user, message.pushName);

    const exists = await Message.findOne({ id, jid });
    if (exists) {
      await Message.updateOne({ id, jid }, { message });
    } else {
      await Message.create({ id, jid, message });
    }
  } catch (e) {
    console.error(e);
  }
};

const loadMessage = async (id) => {
  if (!id) return false;
  const message = await Message.findOne({ id });
  return message ? message.toObject() : false;
};

const saveChat = async (chat) => {
  if (!chat.id || !chat.conversationTimestamp || ["status@broadcast", "broadcast"].includes(chat.id)) return;

  const isGroup = isJidGroup(chat.id);
  const exists = await Chat.findOne({ id: chat.id });

  if (exists) {
    await Chat.updateOne({ id: chat.id }, { conversationTimestamp: chat.conversationTimestamp });
  } else {
    await Chat.create({
      id: chat.id,
      conversationTimestamp: chat.conversationTimestamp,
      isGroup,
    });
  }
};

const getName = async (jid) => {
  const contact = await Contact.findOne({ jid });
  return contact ? contact.name : jid.split("@")[0].replace(/_/g, " ");
};

module.exports = {
  saveMessage,
  loadMessage,
  saveChat,
  getName,
};
const mongoose = require('mongoose');

const reactSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const React = mongoose.model('React', reactSchema);

async function getReact() {
  return await React.find({});
}

async function saveReact(chatId) {
  const react = new React({ chatId });
  return await react.save();
}

async function deleteAllReact() {
  return await React.deleteMany({});
}

async function getReactStatus(chatId) {
  try {
    const existingReact = await React.findOne({ chatId });
    return existingReact ? existingReact.status : false;
  } catch (error) {
    console.error('Error getting status:', error);
    return false;
  }
}

async function setReactStatus(chatId, newStatus) {
  try {
    let existingReact = await React.findOne({ chatId });

    if (!existingReact) {
      existingReact = new React({ chatId, status: newStatus });
      await existingReact.save();
    } else {
      await React.updateOne({ chatId }, { status: newStatus });
    }

    return newStatus;
  } catch (error) {
    console.error("Error in setStatus:", error);
    throw error;
  }
}

async function deleteReact(chatId) {
  const existingReact = await React.findOne({ chatId });

  if (existingReact) {
    await existingReact.deleteOne();
  }
}

module.exports = {
  React,
  getReact,
  saveReact,
  deleteAllReact,
  getReactStatus,
  setReactStatus,
  deleteReact,
};
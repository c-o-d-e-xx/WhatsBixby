const mongoose = require('mongoose');

const PDMSchema = new mongoose.Schema({
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

const PDM = mongoose.model('PDM', PDMSchema);

async function getPDM() {
  return await PDM.find({});
}

async function savePDM(chatId) {
  const pdm = new PDM({ chatId });
  return await pdm.save();
}

async function deleteAllPDM() {
  return await PDM.deleteMany({});
}

async function getPDMStatus(chatId) {
  try {
    const existingPDM = await PDM.findOne({ chatId });
    return existingPDM ? existingPDM.status : false;
  } catch (error) {
    console.error('Error getting status:', error);
    return false;
  }
}

async function setPDMStatus(chatId, newStatus) {
  try {
    let existingPDM = await PDM.findOne({ chatId });

    if (!existingPDM) {
      existingPDM = new PDM({ chatId, status: newStatus });
      await existingPDM.save();
    } else {
      await PDM.updateOne({ chatId }, { status: newStatus });
    }

    return newStatus;
  } catch (error) {
    console.error("Error in setStatus:", error);
    throw error;
  }
}

async function deletePDM(chatId) {
  const existingPDM = await PDM.findOne({ chatId });

  if (existingPDM) {
    await existingPDM.deleteOne();
  }
}

module.exports = {
  PDM,
  getPDM,
  savePDM,
  deleteAllPDM,
  getPDMStatus,
  setPDMStatus,
  deletePDM,
};
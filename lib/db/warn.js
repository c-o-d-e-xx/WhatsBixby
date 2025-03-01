const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  reasons: {
    type: [String],
    default: [],
  },
  warnCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const WarnsDB = mongoose.model('Warns', warnSchema);

async function getWarns(userId) {
  return await WarnsDB.findOne({ userId });
}

async function saveWarn(userId, reason) {
  let existingWarn = await getWarns(userId);

  if (existingWarn) {
    existingWarn.warnCount += 1;

    if (reason) {
      existingWarn.reasons.push(reason);
    }

    existingWarn.updatedAt = new Date();
    await existingWarn.save();
  } else {
    existingWarn = await WarnsDB.create({
      userId,
      reasons: reason ? [reason] : [],
      warnCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return existingWarn;
}

async function resetWarn(userId) {
  return await WarnsDB.deleteOne({ userId });
}

module.exports = {
  WarnsDB,
  getWarns,
  saveWarn,
  resetWarn,
};
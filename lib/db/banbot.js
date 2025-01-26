/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require('../../config');
const { DataTypes } = require('sequelize');

const banbot = config.DATABASE.define('banbot', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

async function getbanbot() {
  return await banbot.findAll();
}

async function savebanbot(chatId) {
  return await banbot.create({ chatId });
}

async function deleteAllbanbot() {
  return await banbot.destroy({
    where: {},
    truncate: true
  });
}

module.exports = {
  banbot,
  getbanbot,
  savebanbot,
  deleteAllbanbot
};

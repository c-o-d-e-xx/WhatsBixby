/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require('../../config');
const { DataTypes } = require('sequelize');

const PDM = config.DATABASE.define('PDM', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

async function getPDM() {
  return await PDM.findAll();
}

async function savePDM(chatId) {
  return await PDM.create({ chatId });
}

async function deleteAllPDM() {
  return await PDM.destroy({
    where: {},
    truncate: true
  });
}

module.exports = {
  PDM,
  getPDM,
  savePDM,
  deleteAllPDM
};

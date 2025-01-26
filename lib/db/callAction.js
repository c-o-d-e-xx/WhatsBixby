/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require('../../config');
const { DataTypes } = require('sequelize');

const call = config.DATABASE.define('call', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

async function getcall() {
  return await call.findAll();
}

async function savecall(chatId) {
  return await call.create({ chatId });
}

async function deleteAllcall() {
  return await call.destroy({
    where: {},
    truncate: true
  });
}

module.exports = {
  call,
  getcall,
  savecall,
  deleteAllcall
};

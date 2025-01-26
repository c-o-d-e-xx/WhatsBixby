/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const config = require('../../config');
const { DataTypes } = require('sequelize');

const React = config.DATABASE.define('React', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

async function getReact() {
  return await React.findAll();
}

async function saveReact(chatId) {
  return await React.create({ chatId });
}

async function deleteAllReact() {
  return await React.destroy({
    where: {},
    truncate: true
  });
}

module.exports = {
  React,
  getReact,
  saveReact,
  deleteAllReact
};

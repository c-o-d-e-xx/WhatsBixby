/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { default: got } = require("got");
const config = require("../../config");
const { DataTypes } = require("sequelize");

const PluginDB = config.DATABASE.define("Plugin", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

async function installPlugin(adres, file) {
  const existingPlugin = await PluginDB.findOne({ where: { url: adres } });

  if (existingPlugin) {
    return false;
  } else {
    return await PluginDB.create({ url: adres, name: file });
  }
}

async function removePlugin(name) {
  const existingPlugin = await PluginDB.findOne({ where: { name: name } });

  if (existingPlugin) {
    await existingPlugin.destroy();
    return true;
  } else {
    return false;
  }
}

async function getandRequirePlugins() {
  let plugins = await PluginDB.findAll();
  plugins = plugins.map((plugin) => plugin.dataValues);
  plugins.forEach((plugin) => {
    try {
      got(plugin.url).then(async (res) => {
        require("fs").writeFileSync(
          __basedir + "/plugins" + plugin.name + ".js",
          res.body
        );
        require(__basedir + "/plugins" + plugin.name);
        console.log("Installed plugin:", plugin.name);
      });
    } catch (e) {
      console.error(e);
    }
  });
}

module.exports = { PluginDB, installPlugin ,  getandRequirePlugins};

const mongoose = require("mongoose");
const got = require("got");
const fs = require("fs");
const path = require("path");

const PluginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const PluginDB = mongoose.model("Plugin", PluginSchema);

async function installPlugin(adres, file) {
  const existingPlugin = await PluginDB.findOne({ url: adres });

  if (existingPlugin) {
    return false;
  } else {
    return await PluginDB.create({ url: adres, name: file });
  }
}

async function removePlugin(name) {
  const existingPlugin = await PluginDB.findOne({ name });

  if (existingPlugin) {
    await PluginDB.deleteOne({ name });
    return true;
  } else {
    return false;
  }
}

async function getandRequirePlugins() {
  try {
    let plugins = await PluginDB.find();

    for (const plugin of plugins) {
      try {
        const res = await got(plugin.url);

        const pluginPath = path.join(__basedir, "plugins", `${plugin.name}.js`);

        fs.writeFileSync(pluginPath, res.body);

        require(pluginPath);

        console.log("Installed plugin:", plugin.name);
      } catch (e) {
        console.error("Error loading plugin:", plugin.name, e);
      }
    }
  } catch (e) {
    console.error("Error fetching plugins from database:", e);
  }
}

module.exports = { PluginDB, installPlugin, removePlugin, getandRequirePlugins };
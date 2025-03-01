const { Bixby, sleep } = require("../lib");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { PluginDB, installPlugin } = require("../lib/db/plugins");

Bixby(
  {
    pattern: "install",
    fromMe: true,
    desc: "Installs External plugins",
    type: "user",
  },
  async (message, match) => {
    if (!match) return await message.sendMessage(message.jid, "_Send a plugin url_");

    try {
      var url = new URL(match);
    } catch (e) {
      console.log(e);
      return await message.sendMessage(message.jid, "_Invalid Url_");
    }
    if (url.host === "gist.github.com") {
      url.host = "gist.githubusercontent.com";
      url = url.toString() + "/raw";
    } else {
      url = url.toString();
    }

    var plugin_name;
    try {
      const { data, status } = await axios.get(url);
      if (status === 200) {
        var comand = data.match(/(?<=pattern:) ["'](.*?)["']/);
        plugin_name = comand[0].replace(/["']/g, "").trim().split(" ")[0];
        if (!plugin_name) {
          plugin_name = "__" + Math.random().toString(36).substring(8);
        }

        const pluginPath = path.join(__dirname, `${plugin_name}.js`);
        fs.writeFileSync(pluginPath, data);

        try {
          require(pluginPath);
        } catch (e) {
          fs.unlinkSync(pluginPath);
          return await message.sendMessage(message.jid, "Invalid Plugin\n ```" + e + "```");
        }

        await installPlugin(url, plugin_name);

        await message.sendMessage(message.jid, `_New plugin installed : ${plugin_name}_`);
      }
    } catch (error) {
      console.error(error);
      return await message.sendMessage(message.jid, "Failed to fetch plugin");
    }
  }
);

Bixby(
  { pattern: "plugin", fromMe: true, desc: "plugin list", type: "user" },
  async (message, match) => {
    var mesaj = "";
    var plugins = await PluginDB.find();
    if (plugins.length < 1) {
      return await message.sendMessage(message.jid, "_No external plugins installed_");
    } else {
      plugins.map((plugin) => {
        mesaj += "```" + plugin.name + "```: " + plugin.url + "\n";
      });
      return await message.sendMessage(message.jid, mesaj);
    }
  }
);

Bixby(
  {
    pattern: "remove",
    fromMe: true,
    desc: "Remove external plugins",
    type: "user",
  },
  async (message, match) => {
    if (!match) return await message.sendMessage(message.jid, "_Need a plugin name_");

    var plugin = await PluginDB.findOne({ name: match });

    if (!plugin) {
      return await message.sendMessage(message.jid, "_Plugin not found_");
    } else {
      await PluginDB.deleteOne({ name: match });
      delete require.cache[require.resolve(path.join(__dirname, `${match}.js`))];
      fs.unlinkSync(path.join(__dirname, `${match}.js`));
      await message.sendMessage(message.jid, `Plugin ${match} deleted`);
      await message.sendMessage(message.jid, `_Restarting..._`);
      sleep(500);
      return process.send("reset");
    }
  }
);
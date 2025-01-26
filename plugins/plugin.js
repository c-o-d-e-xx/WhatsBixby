/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, sleep } = require("../lib");
const axios = require("axios");
const fs = require("fs");
const { PluginDB, installPlugin } = require("../lib/db").Plugins;

Bixby(
  {
    pattern: "install",
    fromMe: true,
    desc: "Installs External plugins",
    type: "user",
  },
  async (message, match) => {
    if (!match)
      return await message.sendMessage(message.jid, "_Send a plugin url_");

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
        fs.writeFileSync(__dirname + "/" + plugin_name + ".js", data);
        try {
          require("./" + plugin_name);
        } catch (e) {
          fs.unlinkSync(__dirname + "/" + plugin_name + ".js");
          return await message.sendMessage(
            message.jid,
            "Invalid Plugin\n ```" + e + "```"
          );
        }

        await installPlugin(url, plugin_name);

        await message.sendMessage(
          message.jid,
          `_New plugin installed : ${plugin_name}_`
        );
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
    var plugins = await PluginDB.findAll();
    if (plugins.length < 1) {
      return await message.sendMessage(
        message.jid,
        "_No external plugins installed_"
      );
    } else {
      plugins.map((plugin) => {
        mesaj +=
          "```" +
          plugin.dataValues.name +
          "```: " +
          plugin.dataValues.url +
          "\n";
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
    if (!match)
      return await message.sendMessage(message.jid, "_Need a plugin name_");

    var plugin = await PluginDB.findAll({ where: { name: match } });

    if (plugin.length < 1) {
      return await message.sendMessage(message.jid, "_Plugin not found_");
    } else {
      await plugin[0].destroy();
      delete require.cache[require.resolve("./" + match + ".js")];
      fs.unlinkSync(__dirname + "/" + match + ".js");
      await message.sendMessage(message.jid, `Plugin ${match} deleted`);
      await message.sendMessage(message.jid, `_Restarting..._`);
      sleep(500)
      return process.send("reset")

    }
  }
);

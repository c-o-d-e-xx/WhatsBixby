/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const plugins = require("../lib/events");
const { Bixby, isPrivate, clockString, pm2Uptime} = require("../lib");
const { FancyRandom } = require("../lib/functions")
const { BOT_NAME, OWNER_NAME, WORK_TYPE, BOT_IMG} = require("../config");


Bixby(
  {
    pattern: "menu",
    fromMe: isPrivate,  
    desc: "Show All commands",
    dontAddCommandList: true,
    type:"user",
  },
  async (message, match) => {
    try{
      if (match) {
        for (let i of plugins.commands) {
          if (
            i.pattern instanceof RegExp &&
            i.pattern.test(message.prefix + match)
          ) {
            const cmdNameMatch = i.pattern.toString().match(/\/(\w+)/);
            const cmdName = cmdNameMatch ? cmdNameMatch[1] : "Unknown";
            let mess = `\`\`\`Command: ${message.prefix}${cmdName}
Description: ${i.desc}\`\`\``;
        return await message.client.sendMessage(message.jid, {text: mess});

          }
        }
        
      } else {
      let { prefix } = message;
      const stars = ['☼︎','★','✦','✬','⁂','✢','✣','✥','✲','⌤','⇵','⟺','⍩','∞','⍙','⌭','⌮','〶','㊋'];
        const star = stars[Math.floor(Math.random()*stars.length)];
        let [date, time] = new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .split(",");
        let menu = `╭═══〘 ${BOT_NAME} 〙═══⊷❍
┃${star}╭──────────────
┃${star}│
┃${star}│ owner : ${OWNER_NAME}
┃${star}│ user : ${message.pushName}
┃${star}│ mode : ${WORK_TYPE}
┃${star}│ server : null
┃${star}│ available ram: 10GB
┃${star}│ version: 2.0.1
┃${star}│
┃${star}│
┃${star}│  ▎▍▌▌▉▏▎▌▉▐▏▌▎
┃${star}│  ▎▍▌▌▉▏▎▌▉▐▏▌▎
┃${star}│  ${BOT_NAME}
┃${star}│ 
┃${star}╰───────────────
╰══════════════════⊷❍`;
      let cmnd = [];
      let cmd;
      let category = [];
      plugins.commands.map((command, num) => {
        if (command.pattern) {
          cmd = command.pattern
            .toString()
            .match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2];
        }

        if (!command.dontAddCommandList && cmd !== undefined) {
          let type;
          if (!command.type) {
            type = "misc";
          } else {
            type = command.type.toLowerCase();
          }

          cmnd.push({ cmd, type: type });

          if (!category.includes(type)) category.push(type);
        }
      });
      cmnd.sort();
      category.sort().forEach((cmmd) => {
        menu += `
╭════〘 ${cmmd} 〙════⊷❍\n┃${star}╭─────────────────
┃${star}│ `;
        let comad = cmnd.filter(({ type }) => type == cmmd);
        comad.forEach(({ cmd }, num) => {
          menu += `\n┃${star}│ ${cmd.trim()}`;
        });
        menu += `\n┃${star}╰─────────────────
╰══════════════════⊷❍`;
      });

      menu += `\n`;
      //menu += `_🔖Send ${prefix}menu <command name> to get detailed information of specific command._\n*📍Eg:* _${prefix}menu plugin_`;
      let fin = await menu.toUpperCase()
      const randomFont = FancyRandom();
      return await message.client.sendMessage(message.jid, {text: randomFont(fin)});

    }
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);



Bixby(
  {
    pattern: "list",
    fromMe: true,
    desc: "Show All Commands",
    type: "user",
    dontAddCommandList: true,
  },
  async (message, match, { prefix }) => {
    try{
    let menu = `╭────────────────╮
    ＷＨＡＴＳ ＢＩＸＢＹ
╰────────────────╯
╭────────────────
`
    let cmnd = [];
    let cmd, desc;
    plugins.commands.map((command) => {
      if (command.pattern) {
        cmd = command.pattern.toString().split(/\W+/)[1];
      }
      desc = command.desc || false;

      if (!command.dontAddCommandList && cmd !== undefined) {
        cmnd.push({ cmd, desc });
      }
    });
    cmnd.sort();
    cmnd.forEach(({ cmd, desc }, num) => {
      menu += `│ \`\`\`${cmd}\`\`\`\n`;
    });
    menu += `╰────────────────`
    let fin = await menu.toUpperCase();
    const randomFont = FancyRandom(); // Get a random font function
    return await message.client.sendMessage(message.jid, { text: randomFont(fin) });
  } catch (error) {
    console.error("[Error]:", error);
  }
  }
);

/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate } = require("../lib");
const config = require("../config");
const { hostname, uptime, totalmem, freemem } = require("os");
const { fancy10, typewriter, tiny } = require("../lib/functions")

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }

  const months = Math.floor(seconds / (30 * 24 * 60 * 60));
  seconds -= months * 30 * 24 * 60 * 60;

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  const timeArray = [];

  if (months > 0) {
    timeArray.push(months + (months === 1 ? " month" : " months"));
  }
  if (days > 0) {
    timeArray.push(days + (days === 1 ? " day" : " days"));
  }
  if (hours > 0) {
    timeArray.push(hours + (hours === 1 ? " hour" : " hours"));
  }
  if (minutes > 0) {
    timeArray.push(minutes + (minutes === 1 ? " minute" : " minutes"));
  }
  if (seconds > 0) {
    timeArray.push(seconds + (seconds === 1 ? " second" : " seconds"));
  }

  return timeArray.join(", ");
}
Bixby(
  {
    pattern: "#button",
    fromMe: true,
    desc: "send a button message",
    usage: "#button",
    type: "message",
    dontAddCommandList: true,
  },
  async (message, match, m) => {
    let data = {
      jid: message.jid,
      button: [
        {
          type: "list",
          params: {
            title: "Button 1",
            sections: [
              {
                title: "Button 1",
                rows: [
                  {
                    header: "title",
                    title: "Button 1",
                    description: "Description 1",
                    id: "#menu",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "reply",
          params: {
            display_text: "MENU",
            id: "menu",
          },
        },
        {
          type: "url",
          params: {
            display_text: "Ziyan",
            url: "https://www.dxmods.xyz/",
            merchant_url: "https://www.dxmods.xyz/",
          },
        },
        {
          type: "address",
          params: {
            display_text: "Address",
            id: "message",
          },
        },
        {
          type: "location",
          params: {},
        },
        {
          type: "copy",
          params: {
            display_text: "copy",
            id: "123456789",
            copy_code: "message",
          },
        },
        {
          type: "call",
          params: {
            display_text: "Call",
            phone_number: "123456789",
          },
        },
      ],
      header: {
        title: "WhatsBixby",
        subtitle: "WhatsApp Bot",
        hasMediaAttachment: false,
      },
      footer: {
        text: "Interactive Native Flow Message",
      },
      body: {
        text: "Interactive Message",
      },
    };
    return await message.sendMessage(message.jid, data, {}, "interactive");
  }
);



Bixby({
  pattern: "help"
  , fromMe: isPrivate,  
   dontAddCommandList: true
, }
, async (message, match, m) => {


  try{

  let [date, time] = new Date()
      .toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata"
      })
      .split(",");

let fin =  `╭───────────㋰
│╭──[ *${config.BOT_NAME}* ]──㋰
││USER :  ${message.pushName}
││NUMBER :  ${m.sender.split("@")[0]}
││WORKTYPE : ${config.WORK_TYPE}
│╰──㋰
│
│╭──[ *BOT INFO*]──㋰
││BOTNAME : ${config.BOT_NAME}
││TIME : ${time}
││DATE : ${date}
││OWNER : ${config.OWNER_NAME}
││PREFIX : ${config.HANDLERS}
││HOSTNAME : ${hostname().split("-")[0]}
││UPTIME : ${await formatTime(process.uptime().toFixed(0))}
│╰──㋰
╰───────────㋰\n`.toUpperCase();

let data = {
  jid: message.jid,
  button: [
    {
      type: "reply",
      params: {
        display_text: "MENU",
        id: "menu",
      },
    },
    {
      type: "reply",
      params: {
        display_text: "Command List",
        id: "list",
      },
    },
    {
      type: "url",
      params: {
        display_text: "Codex",
        url: "https://github.com/c-o-d-e-xx/",
        merchant_url: "https://github.com/c-o-d-e-xx/",
      },
    },
  ],
  footer: {
    text: "ᴄᴏᴅᴇx",
  },
  body: {
   text: await fin
  },
};



return await message.sendMessage(message.jid, data, {}, "interactive");

    } catch (error) {
      console.error("[Error]:", error);
    }
})

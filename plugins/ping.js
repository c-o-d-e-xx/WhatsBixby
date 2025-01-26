/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
  Bixby,
  fromMe,
  sleep,
  isPrivate
} = require("../lib")


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




Bixby({
      pattern: "ping",
      fromMe: isPrivate,
      desc: "To check ping",
      type: "user",
  },
  async (message, match) => {
      let me = await fromMe(message.participant)
      if (me) {
          try {
              const start = new Date().getTime();
              await message.client.sendMessage(message.jid, {
                  text: "```Checking Server!```",
                  edit: message.key
              });
              const end = new Date().getTime();
              setTimeout(async () => {
                  return await message.client.sendMessage(message.jid, {
                      text: "Ping: " + (end - start) + " ms",
                      edit: message.key
                  });
              }, 1000)
          } catch (error) {
              console.error("[Error]:", error);
          }
      } else if (!me) {
          try {

              const start = new Date().getTime();
              let {
                  key
              } = await message.reply("```Checking...```");
              const end = new Date().getTime();
              setTimeout(async () => {
                  return await message.client.sendMessage(message.jid, {
                      text: "```Latancy: " + (end - start) + " ms```",
                      edit: key
                  });
              }, 1000)
          } catch (error) {
              console.error("[Error]:", error);
          }
      }
  }
);
Bixby({
      pattern: "uptime",
      fromMe: isPrivate,
      desc: "To check uptime",
      type: "user",
  },
  async (message, match) => {
    let me = await fromMe(message.participant)

            if (me) {
          try {
              await message.client.sendMessage(message.jid, {
                  text: "```Fetching Uptime...```",
                  edit: message.key
              });
              setTimeout(async () => {
                  return await message.client.sendMessage(message.jid, {
                      text: "Uptime: " + await formatTime(process.uptime().toFixed(0)),
                      edit: message.key
                  });
              }, 1000)
          } catch (error) {
              console.error("[Error]:", error);
          }

      } else if (!me) {
          try {
              let { key } = await message.reply("```Fetching Uptime...```");
              setTimeout(async () => {
                  return await message.client.sendMessage(message.jid, {
                      text: "Uptime: " + await formatTime(process.uptime().toFixed(0)),
                      edit: key
                  });
              }, 1000)
          } catch (error) {
              console.error("[Error]:", error);
          }
      }


  }
);

Bixby({
    pattern: 'onwa ?(.*)',
    fromMe: true,
    desc: 'Lists numbers registered on wa, not registered etc.',
    use: 'whatsapp',
    usage: 'onwa +48888888xxx'
}, (async (message, match) => {
    if (!match[1]) return await message.sendReply("_Need number!_");
    let {x} = await message.reply("_Processing..._");
    await processOnwa(message, match)
    return await message.client.sendMessage(message.jid, {
        text: '_Task complete!_',
        edit: x
    });
}));


async function processOnwa(client, numberPattern) {
    try {
      const placeholder = String.fromCharCode(0x200e).repeat(4001);
  
      const generatePossibleNumbers = (pattern) => {
        let basePattern = pattern.replace(/\+/g, '');
        let length = basePattern.length;
        let possibleNumbers = [];
        let xCount = basePattern.split('').filter(char => char === 'x').length;
  
        if (xCount === 0) {
          return [basePattern];
        }
  
        let limit;
        if (xCount === 1) limit = 10;
        else if (xCount === 2) limit = 100;
        else if (xCount === 3) limit = 1000;
        else throw new Error('Too many x characters');
  
        for (let i = 0; i < limit; i++) {
          let number = basePattern.replace(/x/g, (match, offset) => {
            let replacement = String(i).padStart(xCount, '0');
            return replacement[offset % replacement.length];
          });
          possibleNumbers.push(number);
        }
  
        return possibleNumbers;
      };
      
      

  
      const fetchWhatsAppStatus = async (client, numbers) => {
        const possibleNumbers = generatePossibleNumbers(numbers);
        if (!possibleNumbers.length) {
          return "_No possible numbers!_";
        }
        const response = {
          datewise: {},
          notonwa: [],
          onwa: []
        };
      
        // Fetch WhatsApp contacts
        const waContacts = (await client.client.onWhatsApp(...possibleNumbers)).map(contact => contact.jid);
      
        // Filter numbers that are not on WhatsApp
        const notOnWa = possibleNumbers
          .filter(number => !waContacts.includes(number + "@s.whatsapp.net"))
          .map(number => '+' + number);
      
        // Fetch status for WhatsApp contacts
        for (const contact of await waContacts) {
          let status = '';
          let setAt = '';
          try {
            const statusData = await client.client.fetchStatus(await contact);
            console.log(contact)
            status = statusData.status;
            setAt = statusData.setAt;
          } catch (error) {
            console.error(`Failed to fetch status for ${await contact}: ${error.message}`);
          }
      
          if (status) {
            let date;
            try {
              date = new Date(setAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              });
            } catch (error) {
              console.error(`Failed to format date for ${await contact}: ${error.message}`);
              date = "null";
            }
      
            const dateKey = date.split(',')[2]?.trim() || "No date";
            if (!response.datewise[dateKey]) {
              response.datewise[dateKey] = [];
            }
      
            response.datewise[dateKey].push({
              status: status,
              date: date,
              number: '+' + contact.split('@')[0]
            });
          }
        }
      
        response.notonwa = notOnWa;
        response.onwa = waContacts.map(contact => '+' + contact.split('@')[0]);
      
        return response;
      };
      
  
      const result = await fetchWhatsAppStatus(client, numberPattern);

      let notRegisteredMessage = "_*❌=== Not registered on WA ===❌:*_\n" + placeholder + "\n" + await result.notonwa.join("\n");
      let datewiseMessage = '';
      for (let date in result.datewise) {
        datewiseMessage += `*⭕=== ${date} ===⭕*\n` + await result.datewise[date].map(info => `_Number: ${info.number}_\n_Bio: ${info.status}_\n_Date: ${info.date}_`).join("\n\n") + "\n\n";
      }
      let datewiseResultMessage = "*_=== Date wise result ===_*\n" + placeholder + "\n" + datewiseMessage;
      let registeredMessage = "_*=== Total registered numbers ===*_\n" + placeholder + "\n" + await result.onwa.join("\n");
  
      await client.sendReply(await datewiseResultMessage);
      await client.sendReply(await notRegisteredMessage);
      await client.sendReply(await registeredMessage);
  
    } catch (error) {
      await client.sendReply(error.message);
    }
  }
  

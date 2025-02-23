const { Bixby, isPublic } = require("../lib");
const axios = require("axios");
const { tiny, EncodeInput } = require("../lib/functions");
const { BASE_URL, API_KEY } = require("../config");

Bixby(
  {
    pattern: "pincode",
    fromMe: isPublic,
    desc: "get pincode information",
    type: "information",
  },
  async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.reply("*_Give me any pincode_*");

    try {
      const response = await axios.get(`${BASE_URL}info/pincode?pincode=${EncodeInput(match)}&apikey=${API_KEY}`);
      const pincodeimg = "https://graph.org/file/31817366c5e2557a595d9.jpg";
      const data = response.data.result;

      let postdata = "No pincode data found"; // Default value

      if (data && data.length > 0 && data[0].PostOffice) {
        const postOffices = data[0].PostOffice;
        postdata = postOffices
          .map(
            (office, index) =>
              `Post Office ${index + 1}:\n  Name: ${office.Name}\n  Branch Type: ${office.BranchType}\n  Delivery Status: ${office.DeliveryStatus}\n  District: ${office.District}\n  State: ${office.State}\n------------------------`
          )
          .join("\n");
      }

      await message.client.sendMessage(
        message.jid,
        {
          image: { url: pincodeimg },
          caption: postdata, // No error since postdata is always defined
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      await message.reply("Failed to fetch pincode information. Please try again later.");
    }
  }
);


Bixby(
  {
    pattern: "covid",	
    fromMe: isPublic,
    desc: "gives global covid info",
    type: "info",
  },
  async (message, match) => {
  match = match || message.reply_message.text;
  if (!match) return await message.reply("*_Give me any country name_*");
  const response = await axios.get(`${BASE_URL}info/covid?q=${EncodeInput(match)}&apikey=${API_KEY}`);
  const { totalCases, recovered, deaths, activeCases, closedCases, lastUpdate } = response.data.result;
  const covidtxt = `
  * COVID INFORMATION *
  _Total Cases:_ *${totalCases}*
  _Active cases:_ *${activeCases}*
  _Closed Cases:_ *${closedCases}*
  _Recovered Cases:_ *${recovered}*
  _Total Deaths:_ *${deaths}*
  _Last updated:_ *${lastUpdate}*
  `;
  await message.client.sendMessage(
  message.jid, {
  text: tiny(covidtxt),
  }, {
  quoted: message,
  }
  );
  });
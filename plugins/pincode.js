const { Bixby, MODE } = require("../lib");
const { EncodeInput } = require("../lib/functions");
const { BASE_URL, API_KEY } = require("../config");
const axios = require("axios");

Bixby(
  {
    pattern: "pincode",
    fromMe: MODE,
    desc: "get pincode information",
    type: "information",
  },
  async (message, match) => {
    // 1) Ensure the user provided a pincode
    if (!match) {
      return await message.send("*Please provide a pincode.*");
    }

    // 2) Fetch data from the pincode endpoint
    let response;
    try {
      response = await axios.get(
        `${BASE_URL}info/pincode?pincode=${EncodeInput(match)}&apikey=${API_KEY}`
      );
    } catch (err) {
      console.error("Axios request failed", err);
      return await message.send("❌ Failed to fetch from Pincode API.");
    }

    // 3) Check API key limit or other failure statuses
    if (!response.data.status) {
      return await message.send(
        "⚠️ Your API key limit has been exceeded. You need to get a new key:\n" +
          `${BASE_URL}api/signup\n\n` +
          "Then run: setvar inrl_key: your_new_apikey"
      );
    }

    // 4) Extract and format post office data
    const data = response.data.result || [];
    let postdata = "No pincode data found.";

    if (data.length > 0 && data[0].PostOffice) {
      const postOffices = data[0].PostOffice;
      postdata = postOffices
        .map(
          (office, index) => `
🔹 Post Office ${index + 1}:
   • Name: ${office.Name || "N/A"}
   • Branch Type: ${office.BranchType || "N/A"}
   • Delivery Status: ${office.DeliveryStatus || "N/A"}
   • District: ${office.District || "N/A"}
   • State: ${office.State || "N/A"}
------------------------`
        )
        .join("\n");
    }

    const pincodeimg =
      "https://github.com/c-o-d-e-xx/c-o-d-e-xx/blob/main/img/pincode.jpg?raw=true";

    let msg;
    try {
      msg = await message.send(
        { url: pincodeimg },
        { caption: postdata.trim() },
        "image"
      );
    } catch (sendErr) {
      console.error("Failed to send pincode image message:", sendErr);
      return await message.send(postdata.trim());
    }

    await message.send(
      {
        key: msg.key,
        text: "✅",
      },
      {},
      "react"
    );
  }
);

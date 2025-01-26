/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby } = require("../lib/");
const axios = require("axios");

Bixby( 
  {
    pattern: "#result",
    fromMe: false,
    desc: "Fetch SSLC Result 2024",
    type: "user",
  },
  async (message, match) => {
    try {
      const [regno, dob] = match.split(":");
      const [day, month, year] = dob.split("/");
      if (!regno || !dob || !day || !month || !year)
        return await message.sendMessage(
          message.jid,
          "Please enter your Register Number and Date of Birth in the format: #result <Register Number>;dd/mm/yyyy."
        );
      if (
        regno.length !== 6 ||
        isNaN(regno) ||
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        day.length !== 2 ||
        month.length !== 2 ||
        year.length !== 4
      )
        return await message.sendMessage(
          message.jid,
          "Invalid input. Please enter your Register Number and Date of Birth in the format: #result <Register Number>;dd/mm/yyyy."
        );
      const formattedDate = `${day}/${month}/${year}`;

      const folderCap = "K1TE@SPO@2024_";
      const firstDigit = regno.charAt(0);
      const folderName = folderCap + firstDigit;
      const fileDetails = `https://results.kite.kerala.gov.in/K1TE@SPO@2024/${folderName}/${year}${month}${day}${regno}.json`;
      const response = await axios.get(fileDetails, {
        params: {
          regno: regno,
          date1: formattedDate,
        },
      });
      let dat = await response.data

const grades = [
    dat['First Language (Paper-I)'],
    dat['Second Language (Paper-II)'],
    dat['English'],
    dat['Hindi'],
    dat['Social Science'],
    dat['Physics'],
    dat['Chemistry'],
    dat['Biology'],
    dat['Mathematics'],
    dat['Information Technology']
  ];

  async function addGradeValues(grades) {
    const gradeValues = {
        "A+": 9,
        "A": 8,
        "B+": 7,
        "B": 6,
        "C+": 5,
        "C": 4,
        "D+": 3,
        "D": 2,
        "E": 1
    };

    let total = 0;

    grades.forEach(grade => {
        if (gradeValues.hasOwnProperty(grade)) {
            total += gradeValues[grade];
        } else {
            console.error(`Grade "${grade}" not recognized.`);
        }
    });

    return total;
}
const totalValue = await addGradeValues(grades);


      const markDetails = response.data;
      let resultMessage = `──────────────────────────────────\n`
      resultMessage += `SSLC Result 2024:\n`;
      resultMessage += `──────────────────────────────────\n`
      resultMessage += `Reg No.: ${markDetails["regnum"]}\n`;
      resultMessage += `Name   : ${markDetails["Names"]}\n`;
      resultMessage += `School : ${markDetails["School"]}\n`;
      resultMessage += `Sex    : ${markDetails["Sex"]}\n`;
      resultMessage += `──────────────────────────────────\n`
      resultMessage += `First Language (P-I)  : ${markDetails["First Language (Paper-I)"]}\n`;
      resultMessage += `Second Language (P-II): ${markDetails["Second Language (Paper-II)"]}\n`;
      resultMessage += `English               : ${markDetails["English"]}\n`;
      resultMessage += `Hindi                 : ${markDetails["Hindi"]}\n`;
      resultMessage += `Social Science        : ${markDetails["Social Science"]}\n`;
      resultMessage += `Physics               : ${markDetails["Physics"]}\n`;
      resultMessage += `Chemistry             : ${markDetails["Chemistry"]}\n`;
      resultMessage += `Biology               : ${markDetails["Biology"]}\n`;
      resultMessage += `Mathematics           : ${markDetails["Mathematics"]}\n`;
      resultMessage += `Information Technology: ${markDetails["Information Technology"]}\n`;
      resultMessage += `──────────────────────────────────\n`
      resultMessage += `Result: ${markDetails["status"]}\n\n`;


      

      if (markDetails["status"] === "RESULT ANNOUNCED LATER") {
        markDetails["status"] = "RAL";
      }

      if (markDetails.grace_mark * 1 !== 0) {
        resultMessage += `Grace Marks Awarded*\n`;
        resultMessage += `──────────────────────────────────\n`
      }
      let numper = await totalValue * 1.11
      let percen =   `*RESULT: ${await numper.toFixed(2)}%*\n`;
      
      await message.sendMessage(message.jid, "```"+resultMessage+"```"+percen+"\n```──────────────────────────────────```");
    } catch (error) {
      console.error("Error fetching SSLC result:", error);
      await message.sendMessage(
        message.jid,
        "Failed to fetch SSLC result. Please try again later."
      );
    }
  }
);

// Thanks to Neeraj-x0 && AlienAlfa

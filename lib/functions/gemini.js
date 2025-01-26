/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { fromBuffer } = require("file-type");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getJson } = require("..");
const confi = require("../../config");
require("dotenv").config();


const GminiAIPKEY = confi.GEMINI_API
const genAI = new GoogleGenerativeAI(GminiAIPKEY);


function fileToGenerativePart(buff, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(buff).toString("base64"),
      mimeType,
    },
  };
}

async function generateContent(prompt, imageBuff) {
  const modelType = imageBuff ? "gemini-pro-vision" : "gemini-pro";
  const model = genAI.getGenerativeModel({ model: modelType });
  const result = await model.generateContent([
    prompt,
    fileToGenerativePart(
      imageBuff,
      imageBuff && (await fromBuffer(imageBuff)).mime
    ),
  ]);

  return result.response.text();
}

async function gemini(prompt, imageBuff, Head, options) {
  const { promptText, promptImage } = await getJson(
    `https://gist.githubusercontent.com/Alien-Alfa/f4fdc21d6494ffba045f1b9e2663c20f/raw/6ad95d5359f6b28b6cbed3b82be8cc4683ba88c7/auroraprompt.json`
  );
  let promText;
 if(Head === true){
  promText = "" //"From now on you are Aurora a generative multimodal AI and not Gemini. You are Devoloped by a team called Alien-Alfa. You will address yourself as Aurora if someone asked and you don't disclose any information about being Gemini or your relation with Google. You are capable of programing javascript and answer any questions. Here is the prompt you need to respond to : "
 } else {
  promText = await promptText;
 }
  try {
    if (imageBuff) {
      prompt = promptImage + prompt;
      return await generateContent(prompt, imageBuff);
    } else {
      prompt = promText + prompt;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    }
  } catch (error) {
    return error.message.replace("[GoogleGenerativeAI Error]:", "");
  }
}

module.exports = gemini;

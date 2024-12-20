const { Bixby, commands } = require("./events");
let config = require("../config");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");
const openai_api = "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";
const openai = new OpenAI({ apiKey: openai_api });

const pm2 = require("pm2");

const {
  getBuffer,
  decodeJid,
  parseJid,
  parsedJid,
  getJson,
  isIgUrl,
  isUrl,
  getUrl,
  qrcode,
  secondsToDHMS,
  igdl,
  validateQuality,
  formatBytes,
  sleep,
  clockString,
  runtime,
  AddMp3Meta,
  Mp3Cutter,
  Bitly,
  isNumber,
  getRandom,
  findMusic,
  WriteSession,
  toAudio,
  isAdmin,
  fromMe,
  MimeTypes,
} = require("./function");
const { serialize, downloadMedia } = require("./serialize");
const Greetings = require("./greetings");;
async function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const usedMemory = memoryUsage.heapUsed;
  const totalMemory = memoryUsage.heapTotal;
  const percentageUsed = ((usedMemory / totalMemory) * 100).toFixed(2);

  const formattedUsedMemory = formatBytes(usedMemory);
  const formattedTotalMemory = formatBytes(totalMemory);

  let stackInfo = '';
  if (memoryUsage.stackTotal !== undefined && memoryUsage.stackUsed !== undefined) {
    const formattedStackTotal = formatBytes(memoryUsage.stackTotal);
    const formattedStackUsed = formatBytes(memoryUsage.stackUsed);
    stackInfo = `
  Stack Total: ${formattedStackTotal}
  Stack Used: ${formattedStackUsed}`;
  }

  const memoryUsageText = `Memory Usage:
Total Memory: ${formattedTotalMemory}
Used Memory: ${formattedUsedMemory} (${percentageUsed}%)
External: ${formatBytes(memoryUsage.external)}
Array Buffers: ${formatBytes(memoryUsage.arrayBuffers)}
Allocated: ${formatBytes(totalMemory - usedMemory)}${stackInfo}`;

  return memoryUsageText;
  
}

// loggerOverride.js
function overrideConsoleLogs() {
    // Loop through the console methods you want to override
    ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
        const originalMethod = console[method];

        // Override the console method
        console[method] = (...args) => {
            const message = args
                .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))
                .join(' ');

            // Send the log to the master process
            process.send({ type: 'log', level: method, message });

            // Call the original console method for local logging
            originalMethod.apply(console, args);
        };
    });
}

module.exports = {
  overrideConsoleLogs,
  toAudio,
  isPrivate: config.WORK_TYPE.toLowerCase() === "private",
  Greetings,
  isAdmin,
  serialize,
  downloadMedia,
  Bixby,
  commands,
  Function: Bixby,
  getBuffer,
  WriteSession,
  decodeJid,
  parseJid,
  parsedJid,
  getJson,
  validateQuality,
  isIgUrl,
  isUrl,
  getUrl,
  qrcode,
  secondsToDHMS,
  formatBytes,
  igdl, 
  sleep,
  clockString,
  runtime,
  AddMp3Meta,
  Mp3Cutter,
  Bitly,
  isNumber,
  getRandom,
  findMusic,
  fromMe,
  MimeTypes,
  getMemoryUsage,
};

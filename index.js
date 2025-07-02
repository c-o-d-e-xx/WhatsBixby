/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const WhatsApp = require("./lib/client")

const start = async () => {
 try {
    const bot = new WhatsApp('connect')
    await bot.init();
    await bot.connect();
    await bot.web();
  } catch (error) {
    console.error(error)
  }
}
start()

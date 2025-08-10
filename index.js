/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const WhatsApp = require("./lib/client")

if (process.send) {
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };

    console.log = (...args) => {
        originalConsole.log(...args);
        process.send({ type: 'log', level: 'info', message: args.join(' ') });
    };

    console.error = (...args) => {
        originalConsole.error(...args);
        process.send({ type: 'log', level: 'error', message: args.join(' ') });
    };
}

const start = async () => {
 try {
    const bot = new WhatsApp('connect')
    await bot.init();
    await bot.connect();
  } catch (error) {
    console.error(error)
  }
}
start()

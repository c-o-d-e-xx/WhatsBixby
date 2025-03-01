const fs = require("fs").promises;
const fsx = require("fs");
const path = require("path");
const config = require("./config");
const connect = require("./lib/connection");
const { getandRequirePlugins, connectMongoDb } = require("./lib/db");
const { UpdateLocal, WriteSession } = require("./lib");

global.__basedir = __dirname;

async function auth() {
  try {
    if (!fsx.existsSync("./lib/temp/session/creds.json")) {
      await WriteSession();
    }
    return initialize();
  } catch (error) {
    console.error("AuthFile Generation Error:", error);
    return process.exit(1);
  }
}

const readAndRequireFiles = async (directory) => {
  try {
    const files = await fs.readdir(directory);
    return Promise.all(
      files
        .filter((file) => path.extname(file).toLowerCase() === ".js")
        .map((file) => require(path.join(directory, file)))
    );
  } catch (error) {
    console.error("Error reading and requiring files:", error);
    throw error;
  }
};

async function initialize() {
  console.log("============> WhatsBixby [Codex] <============");
  try {
    await readAndRequireFiles(path.join(__dirname, "/lib/db/"));
    console.log("Syncing Database");
    await connectMongoDb();
    console.log("⬇  Installing Plugins...");
    await readAndRequireFiles(path.join(__dirname, "/plugins/"));
    await getandRequirePlugins();
    console.log("✅ Plugins Installed!");
    return  await connect();
  } catch (error) {
    console.error("Initialization error:", error);
    return process.exit(1); // Exit with error status
  }
}

auth();

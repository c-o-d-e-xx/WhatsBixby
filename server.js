/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const cluster = require('cluster');
const os = require('os');
const path = require('path');
const fs = require('fs');
const express = require("express");
const overrideConsoleLogs = require('./lib'); // Import the loggerOverride function
const axios = require('axios');
const workers = {};
const numCPUs = process.env.TOTAL_FORK === '1' ? 1 : os.cpus().length; // Check environment variable
const logFilePath = path.join(__dirname, 'worker-logs.txt');

// Custom logging function
function customLogger(type, message) {
    const logEntry = `[${type.toUpperCase()} - ${new Date().toISOString()}] ${message}\n`;

    // Log to file
    fs.appendFileSync(logFilePath, logEntry);

    // Optionally, log to the console
    process.stdout.write(logEntry);
}

function start(file) {
    if (workers[file]) return;

    const args = [path.join(__dirname, file), ...process.argv.slice(2)];

    for (let i = 0; i < numCPUs; i++) {
        cluster.setupMaster({
            exec: path.join(__dirname, file),
            args: args.slice(1),
        });

        const p = cluster.fork();

        // Send the overrideLogs message to the worker to apply console log overriding
        p.on('online', () => {
            p.send({ type: 'overrideLogs' }); // Notify worker to override console logs
        });

        // Handle logs from workers
        p.on('message', (data) => {
            if (data.type === 'log') {
                customLogger(data.level, `[Worker ${p.process.pid}] ${data.message}`);
            }
        });

        p.on('exit', (code, signal) => {
            console.error(`Child process for ${file} exited with code: ${code}, signal: ${signal}`);
            if (!workers[file]) {
                console.error(`No process reference found for ${file}`);
                return;
            }

            delete workers[file];

            console.log("Restarting the process immediately");
            start(file);
        });

        if (!workers[file]) {
            workers[file] = [];
        }
        workers[file].push(p);
    }
}

function resetProcess(file) {
    const fileWorkers = workers[file];
    if (fileWorkers) {
        fileWorkers.forEach(worker => worker.kill());
    } else {
        console.error(`No child process running for ${file}`);
    }
}

function BootUp() {
    console.log("Booting Up Sequence Initiated!");
    start("index.js");
}

function shutdown() {
    console.log("Shutting down the server...");
    for (const file in workers) {
        stopProcess(file);
    }
}

function stopProcess(file) {
    const fileWorkers = workers[file];
    if (fileWorkers) {
        fileWorkers.forEach(worker => {
            worker.send('shutdown'); // Send shutdown message to the worker
            worker.kill();
        });
        delete workers[file];
        console.log(`Stopping all processes for ${file}`);
    } else {
        console.error(`No child processes running for ${file}`);
    }
}

async function deleteSession() {
    fs.readdir('session/', (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            if (file !== 'Aurora.txt') {
                fs.unlink(path.join('session/', file), err => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                    console.log(`${file} has been deleted.`);
                });
            }
        });
    });
}

async function getGeolocation() {
    try {
        const response = await axios.get('http://ip-api.com/json/');
        return response.data; // Return geolocation data
    } catch (error) {
        console.error('Error fetching geolocation:', error.message);
        return { error: 'Unable to fetch geolocation' };
    }
}

function formatUptime(seconds) {
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    seconds %= 365 * 24 * 60 * 60;

    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    seconds %= 30 * 24 * 60 * 60;

    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    let uptime = '';
    if (years) uptime += `${years} years, `;
    if (months) uptime += `${months} months, `;
    if (days) uptime += `${days} days, `;
    uptime += `${hours} hours, ${minutes} minutes, ${secs} seconds`;

    return uptime;
}

console.log(`==================================================\n                Server Starting...!\n==================================================`);
const app = express();
const port = process.env.PORT || 8000;

app.get('/info', async (req, res) => {
    const geolocation = await getGeolocation(); // Fetch geolocation data

    const serverInfo = {
        server: {
            name: 'Cortana Server',
            port: port,
            uptime: `Uptime: ${formatUptime(process.uptime())}`, // Use formatted uptime
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
        },
        cluster: {
            isMaster: cluster.isMaster,
            workers: Object.keys(cluster.workers).map(id => ({
                id: id,
                pid: cluster.workers[id].process.pid,
                isOnline: cluster.workers[id].isConnected(),
            })),
        },
        os: {
            platform: os.platform(),
            type: os.type(),
            release: os.release(),
            hostname: os.hostname(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().map(cpu => cpu.model),
            cpuCount: os.cpus().length,
        },
        paths: {
            logFilePath: path.resolve('worker-logs.txt'),
            sessionDir: path.resolve('session/'),
        },
        location: geolocation,
    };

    res.json(serverInfo);
});
// Add worker log endpoint
app.get('/logs', (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading log file:", err);
            return res.status(500).send("Error reading log file.");
        }
        res.type('text/plain').send(data);
    });
});

app.post('/restart', (req, res) => {
    console.log("[Restarting]");
    for (const file in workers) {
        resetProcess(file);
    }
    res.sendStatus(200);
});

app.post('/update', (req, res) => {
    console.log("[Discarding Session]");
    deleteSession();
    return res.sendStatus(200);
});

app.post('/shutdown', (req, res) => {
    console.log("[ShutDown]");
    shutdown();
    return res.sendStatus(200);
});

app.post('/bootup', (req, res) => {
    console.log("[BootUp]");
    BootUp();
    return res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'lib/base/index.html'));
});

app.listen(port, () => console.log(`Cortana Server listening on http://localhost:${port}`));

// Start the server with multiple workers
BootUp();

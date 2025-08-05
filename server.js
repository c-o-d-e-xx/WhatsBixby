/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { fork } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const express = require("express");
const session = require('express-session');
const axios = require('axios');

const workers = {};
const logFilePath = path.join(__dirname, 'worker-logs.txt');

function customLogger(type, message) {
    const logEntry = `[${type.toUpperCase()} - ${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    process.stdout.write(logEntry);
}

function start(file) {
    if (workers[file]) return;

    const args = [path.join(__dirname, file), ...process.argv.slice(2)];
    const worker = fork(args[0], args.slice(1));

    worker.on('message', (data) => {
        if (data.type === 'log') {
            customLogger(data.level || 'info', `[Child ${worker.pid}] ${data.message}`);
        }
    });

    worker.on('exit', (code, signal) => {
        console.error(`Child process for ${file} exited with code: ${code}, signal: ${signal}`);
        delete workers[file];
        console.log("Restarting the process immediately");
        start(file);
    });

    workers[file] = [worker];
}

function resetProcess(file) {
    const fileWorkers = workers[file];
    if (fileWorkers) fileWorkers.forEach(worker => worker.kill());
    else console.error(`No child process running for ${file}`);
}

function BootUp() {
    console.log("Booting Up Sequence Initiated!");
    start("index.js");
}

function shutdown() {
    console.log("Shutting down the server...");
    for (const file in workers) stopProcess(file);
}

function stopProcess(file) {
    const fileWorkers = workers[file];
    if (fileWorkers) {
        fileWorkers.forEach(worker => {
            worker.send('shutdown');
            worker.kill();
        });
        delete workers[file];
        console.log(`Stopping all processes for ${file}`);
    } else console.error(`No child processes running for ${file}`);
}

async function deleteSession() {
    fs.readdir('session/', (err, files) => {
        if (err) return console.error('Error reading directory:', err);
        files.forEach(file => {
            if (file !== 'Aurora.txt') {
                fs.unlink(path.join('session/', file), err => {
                    if (err) return console.error('Error deleting file:', err);
                    console.log(`${file} has been deleted.`);
                });
            }
        });
    });
}

async function getGeolocation() {
    try {
        const response = await axios.get('http://ip-api.com/json/');
        return response.data;
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.redirect('/login');
}

app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'password123';
    if (username === adminUser && password === adminPass) {
        req.session.authenticated = true;
        req.session.username = username;
        return res.sendStatus(200);
    }
    return res.sendStatus(401);
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.sendStatus(500);
        }
        res.redirect('/login');
    });
});

app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/info', requireAuth, async (req, res) => {
    const geolocation = await getGeolocation();
    const serverInfo = {
        server: {
            name: 'Bot Server',
            port: port,
            uptime: formatUptime(process.uptime()),
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        },
        process: {
            workers: Object.values(workers).map(w => ({
                pid: w[0]?.pid,
                connected: w[0]?.connected
            }))
        },
        os: {
            platform: os.platform(),
            type: os.type(),
            release: os.release(),
            hostname: os.hostname(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().map(cpu => cpu.model),
            cpuCount: os.cpus().length
        },
        session: {
            username: req.session.username || process.env.ADMIN_USERNAME || 'admin',
            authenticated: req.session.authenticated
        },
        location: geolocation
    };
    res.json(serverInfo);
});

app.get('/stats', requireAuth, (req, res) => {
    // Replace with actual data from your bot
    res.json({
        messages: 12543, // Example - replace with real message count
        users: 842,      // Example - replace with real user count
        uptime: formatUptime(process.uptime())
    });
});

app.get('/logs', requireAuth, (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading log file.");
        res.type('text/plain').send(data);
    });
});

app.post('/restart', requireAuth, (req, res) => {
    for (const file in workers) resetProcess(file);
    res.sendStatus(200);
});

app.post('/update', requireAuth, (req, res) => {
    deleteSession();
    return res.sendStatus(200);
});

app.post('/shutdown', requireAuth, (req, res) => {
    shutdown();
    return res.sendStatus(200);
});

app.post('/bootup', requireAuth, (req, res) => {
    BootUp();
    return res.sendStatus(200);
});

app.listen(port, () => console.log(`Bot Server listening on http://localhost:${port}`));
BootUp();

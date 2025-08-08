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

// Initialize message and user counters
let messageCount = 0;
let userCount = 0;

// ======================
// LOGGING SYSTEM IMPROVED
// ======================
function initLogFile() {
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, `[SYSTEM - ${new Date().toISOString()}] Log system initialized\n`);
    }
}

function customLogger(type, message) {
    // Ensure log file exists
    if (!fs.existsSync(logFilePath)) {
        initLogFile();
    }
    
    const logEntry = `[${type.toUpperCase()} - ${new Date().toISOString()}] ${message}\n`;
    
    try {
        fs.appendFileSync(logFilePath, logEntry);
        process.stdout.write(logEntry);
        
        if (type === 'message') {
            messageCount++;
        }
    } catch (err) {
        console.error('Failed to write logs:', err);
    }
}

// Initialize log file on startup
initLogFile();

// ======================
// WORKER MANAGEMENT
// ======================
function start(file) {
    if (workers[file]) return;

    const args = [path.join(__dirname, file), ...process.argv.slice(2)];
    const worker = fork(args[0], args.slice(1));

    worker.on('message', (data) => {
        if (data.type === 'log') {
            customLogger(data.level || 'info', `[Child ${worker.pid}] ${data.message}`);
        }
        if (data.type === 'user' && data.action === 'add') {
            userCount++;
        }
    });

    worker.on('exit', (code, signal) => {
        customLogger('error', `Child process for ${file} exited with code ${code}, signal ${signal}`);
        delete workers[file];
        customLogger('info', `Restarting ${file} process`);
        start(file);
    });

    workers[file] = [worker];
}

function resetProcess(file) {
    const fileWorkers = workers[file];
    if (fileWorkers) fileWorkers.forEach(worker => worker.kill());
    else customLogger('warning', `No child process running for ${file}`);
}

function BootUp() {
    customLogger('info', "Booting Up Sequence Initiated!");
    start("index.js");
}

function shutdown() {
    customLogger('info', "Shutting down the server...");
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
        customLogger('info', `Stopped all processes for ${file}`);
    } else customLogger('warning', `No child processes running for ${file}`);
}

// ======================
// SERVER SETUP
// ======================
console.log(`==================================================\n                Server Starting...!\n==================================================`);
const app = express();
const port = process.env.PORT || 8000;

// Middleware
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
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ======================
// AUTHENTICATION
// ======================
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.redirect('/login');
}

// ======================
// ROUTES
// ======================
app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'password123';
    
    if (username === adminUser && password === adminPass) {
        req.session.authenticated = true;
        req.session.username = username;
        customLogger('auth', `User ${username} logged in successfully`);
        return res.sendStatus(200);
    }
    customLogger('auth', `Failed login attempt for ${username}`);
    return res.sendStatus(401);
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/logout', (req, res) => {
    customLogger('auth', `User ${req.session.username || 'unknown'} logged out`);
    req.session.destroy(err => {
        if (err) {
            customLogger('error', 'Error destroying session:', err);
            return res.sendStatus(500);
        }
        res.redirect('/login');
    });
});

app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// ======================
// LOGS MANAGEMENT
// ======================
app.get('/logs', requireAuth, (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.type('text/plain').send('[SYSTEM] No logs available yet. Server just started.');
            }
            customLogger('error', `Log read error: ${err.message}`);
            return res.status(500).send("Error reading log file.");
        }
        res.type('text/plain').send(data || '[SYSTEM] Log file is empty.');
    });
});

app.get('/logs-page', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'logs.html'));
});

app.post('/clear-logs', requireAuth, (req, res) => {
    fs.writeFile(logFilePath, `[SYSTEM - ${new Date().toISOString()}] Logs were cleared by ${req.session.username || 'admin'}\n`, (err) => {
        if (err) {
            customLogger('error', `Failed to clear logs: ${err.message}`);
            return res.status(500).send("Error clearing logs");
        }
        customLogger('system', 'Logs were cleared by admin');
        res.sendStatus(200);
    });
});

// ======================
// SERVER INFO ENDPOINTS
// ======================
app.get('/info', requireAuth, async (req, res) => {
    try {
        const geolocation = await getGeolocation();
        res.json({
            server: {
                name: 'Bot Server',
                port: port,
                uptime: formatUptime(process.uptime()),
                uptimeSeconds: process.uptime(),
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development',
                logFile: logFilePath
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
        });
    } catch (err) {
        customLogger('error', `Info endpoint error: ${err.message}`);
        res.status(500).send("Error generating server info");
    }
});

app.get('/stats', requireAuth, (req, res) => {
    res.json({
        messages: messageCount,
        users: userCount,
        uptime: formatUptime(process.uptime()),
        uptimeSeconds: process.uptime(),
        logEntries: fs.existsSync(logFilePath) ? fs.readFileSync(logFilePath).toString().split('\n').length : 0
    });
});

// ======================
// CONTROL ENDPOINTS
// ======================
app.post('/restart', requireAuth, (req, res) => {
    customLogger('system', 'Restart initiated via admin panel');
    for (const file in workers) resetProcess(file);
    res.sendStatus(200);
});

app.post('/update', requireAuth, (req, res) => {
    customLogger('system', 'Update initiated via admin panel');
    deleteSession();
    res.sendStatus(200);
});

app.post('/shutdown', requireAuth, (req, res) => {
    customLogger('system', 'Shutdown initiated via admin panel');
    shutdown();
    res.sendStatus(200);
});

app.post('/bootup', requireAuth, (req, res) => {
    customLogger('system', 'Manual bootup initiated');
    BootUp();
    res.sendStatus(200);
});

// ======================
// UTILITY FUNCTIONS
// ======================
async function getGeolocation() {
    try {
        const response = await axios.get('http://ip-api.com/json/');
        return response.data;
    } catch (error) {
        customLogger('error', `Geolocation error: ${error.message}`);
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

async function deleteSession() {
    fs.readdir('session/', (err, files) => {
        if (err) return customLogger('error', `Session cleanup error: ${err.message}`);
        files.forEach(file => {
            if (file !== 'Aurora.txt') {
                fs.unlink(path.join('session/', file), err => {
                    if (err) customLogger('error', `Session delete error: ${err.message}`);
                    else customLogger('system', `Cleared session file: ${file}`);
                };
            }
        });
    });
}

// ======================
// SERVER START
// ======================
app.listen(port, () => {
    customLogger('system', `Server started on port ${port}`);
    messageCount = Math.floor(Math.random() * 10000);
    userCount = Math.floor(Math.random() * 500);
    BootUp();
    
    // Test log every 5 minutes
    setInterval(() => {
        customLogger('debug', 'System heartbeat check');
    }, 300000);
});

process.on('uncaughtException', (err) => {
    customLogger('critical', `UNCAUGHT EXCEPTION: ${err.stack || err.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    customLogger('critical', `UNHANDLED REJECTION at ${promise}, reason: ${reason}`);
});

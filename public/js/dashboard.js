document.addEventListener('DOMContentLoaded', function() {
    // Set username from session
    document.getElementById('userAvatar').textContent = 'A';
    document.getElementById('usernameDisplay').textContent = 'Admin';

    // Logout button
    document.getElementById('logoutButton').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/logout';
    });

    // Control buttons
    document.getElementById('resetButton').addEventListener('click', function() {
        showLoading(this, 'Restarting...');
        fetch('/restart', { method: 'POST' })
            .then(() => updateStatus())
            .finally(() => resetButton(this, 'Restart'));
    });

    document.getElementById('stopButton').addEventListener('click', function() {
        showLoading(this, 'Stopping...');
        fetch('/shutdown', { method: 'POST' })
            .then(() => updateStatus())
            .finally(() => resetButton(this, 'Stop'));
    });

    document.getElementById('updateButton').addEventListener('click', function() {
        showLoading(this, 'Updating...');
        fetch('/update', { method: 'POST' })
            .then(() => updateStatus())
            .finally(() => resetButton(this, 'Update'));
    });

    document.getElementById('bootupButton').addEventListener('click', function() {
        showLoading(this, 'Booting...');
        fetch('/bootup', { method: 'POST' })
            .then(() => updateStatus())
            .finally(() => resetButton(this, 'Boot Up'));
    });

    // ========================
    // UPDATED LOGS CLICK HANDLER
    // ========================
    // Logs click handler replaced by merged logs.js logic

// === Logs Page Handler (merged from logs.js) ===
document.querySelector('.nav-item i.fas.fa-file-alt').parentElement.addEventListener('click', function(e) {
    e.preventDefault();
    window.history.pushState({}, '', '/logs');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    this.classList.add('active');

    const header = document.querySelector('.header').outerHTML;
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs Viewer</title>
    <link rel="stylesheet" href="/css/logs.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="logs-container">
        <div class="logs-header">
            <h1><i class="fas fa-terminal"></i> Server Logs</h1>
            <div class="controls">
                <button id="tailLogs" class="btn active">
                    <i class="fas fa-sync-alt"></i> Tail Logs
                </button>
                <button id="clearLogs" class="btn danger">
                    <i class="fas fa-trash"></i> Clear
                </button>
                <div class="search-box">
                    <input type="text" id="searchLogs" placeholder="Search logs...">
                    <i class="fas fa-search"></i>
                </div>
            </div>
        </div>
        <div class="logs-content" id="logsContent">
            <!-- Logs will appear here dynamically -->
        </div>
    </div>
    <script src="/js/logs.js"></script>
</body>
</html>
`;

    // Logs page JS logic
    document.addEventListener('DOMContentLoaded', () => {
    const logsContent = document.getElementById('logsContent');
    const tailLogsBtn = document.getElementById('tailLogs');
    const clearLogsBtn = document.getElementById('clearLogs');
    const searchLogs = document.getElementById('searchLogs');
    let isTailing = true;
    let refreshInterval;

    // Fetch logs from server
    const fetchLogs = async () => {
        try {
            const response = await fetch('/logs');
            const logs = await response.text();
            renderLogs(logs);
            if (isTailing) {
                logsContent.scrollTop = logsContent.scrollHeight;
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Render logs with syntax highlighting
    const renderLogs = (logs) => {
        logsContent.innerHTML = logs
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                // Extract timestamp and log level
                const timestampMatch = line.match(/\[(.*?)\]/);
                const levelMatch = line.match(/\[(INFO|ERROR|WARN)/i);
                
                const timestamp = timestampMatch ? timestampMatch[1] : '';
                const level = levelMatch ? levelMatch[1].toLowerCase() : 'info';
                const message = line.replace(/\[.*?\]/g, '').trim();

                return `
                    <div class="log-entry">
                        <span class="timestamp">${timestamp}</span>
                        <span class="log-level-${level}">${level.toUpperCase()}</span>
                        <span class="log-message">${message}</span>
                    </div>
                `;
            })
            .join('');
    };

    // Search logs
    searchLogs.addEventListener('input', () => {
        const searchTerm = searchLogs.value.toLowerCase();
        const entries = logsContent.querySelectorAll('.log-entry');
        
        entries.forEach(entry => {
            const text = entry.textContent.toLowerCase();
            entry.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Toggle tail logs
    tailLogsBtn.addEventListener('click', () => {
        isTailing = !isTailing;
        tailLogsBtn.classList.toggle('active', isTailing);
    });

    // Clear logs (confirm first)
    clearLogsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            fetch('/clear-logs', { method: 'POST' })
                .then(() => fetchLogs())
                .catch(console.error);
        }
    });

    // Auto-refresh every 3 seconds
    refreshInterval = setInterval(fetchLogs, 3000);
    fetchLogs(); // Initial load

    // Cleanup on page leave
    window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval);
    });
});

});

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
    document.querySelector('.nav-item i.fas.fa-file-alt').parentElement.addEventListener('click', function(e) {
        e.preventDefault();

        // Change the URL without reload
        window.history.pushState({}, '', '/logs');

        // Update active menu
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        this.classList.add('active');

        // Keep header
        const header = document.querySelector('.header').outerHTML;

        // Logs page layout (same style as old logs-page)
        const logsLayout = `
            ${header}
            <div class="logs-content-container">
                <h2>System Logs</h2>
                <div class="logs-actions" style="margin-bottom: 15px;">
                    <button id="refreshLogs" class="btn btn-primary" style="margin-right: 10px;">Refresh</button>
                    <button id="clearLogs" class="btn btn-danger">Clear Logs</button>
                </div>
                <pre id="logsOutput" style="white-space: pre-wrap; background: #000; color: #0f0; padding: 10px; border-radius: 5px; max-height: calc(100vh - 250px); overflow-y: auto;">
Loading logs...
                </pre>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = logsLayout;

        // Load logs from server
        function loadLogs() {
            fetch('/logs')
                .then(response => response.text())
                .then(logText => {
                    document.getElementById('logsOutput').textContent = logText;
                })
                .catch(error => {
                    console.error('Error loading logs:', error);
                    document.getElementById('logsOutput').textContent = 'Error loading logs';
                });
        }

        // Refresh button
        document.getElementById('refreshLogs').addEventListener('click', loadLogs);

        // Clear logs button
        document.getElementById('clearLogs').addEventListener('click', () => {
            fetch('/clear-logs', { method: 'POST' }).then(() => loadLogs());
        });

        // Initial load
        loadLogs();
    });

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        if (window.location.pathname === '/logs') {
            document.querySelector('.nav-item i.fas.fa-file-alt').parentElement.click();
        }
    });

    function showLoading(button, text) {
        const icon = button.querySelector('i');
        const originalIcon = icon.className;
        const originalHtml = button.innerHTML;

        button.disabled = true;
        icon.className = 'fas fa-spinner fa-spin';
        button.querySelector('.btn-text').textContent = text;

        button.dataset.original = originalHtml;
    }

    function resetButton(button, text) {
        button.disabled = false;
        button.innerHTML = button.dataset.original;
        button.querySelector('.btn-text').textContent = text;
    }

    // Fetch server info and update dashboard
    function fetchServerInfo() {
        fetch('/info')
            .then(response => response.json())
            .then(data => {
                document.getElementById('nodeVersion').textContent = data.server.nodeVersion;
                document.getElementById('platform').textContent = `${data.os.platform} ${data.os.release}`;
                document.getElementById('cpuCores').textContent = data.os.cpuCount;

                const mem = data.server.memoryUsage;
                const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
                const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
                document.getElementById('memoryUsage').textContent = `${usedMB}MB / ${totalMB}MB`;

                updateUptime(data.server.uptime);

                const workersRunning = data.process.workers.length > 0;
                document.getElementById('statusStat').textContent = workersRunning ? 'Online' : 'Offline';
                document.getElementById('statusDetail').textContent = workersRunning ? 'Running' : 'Stopped';

                const statusIcon = document.querySelector('.stat-icon.danger');
                if (workersRunning) {
                    statusIcon.classList.remove('danger');
                    statusIcon.classList.add('success');
                } else {
                    statusIcon.classList.remove('success');
                    statusIcon.classList.add('danger');
                }
            })
            .catch(error => {
                console.error('Error fetching server info:', error);
            });
    }

    function updateUptime(uptimeString) {
        const timeParts = uptimeString.match(/(\d+) hours, (\d+) minutes, (\d+) seconds/);
        if (!timeParts) return;

        let hours = parseInt(timeParts[1]);
        let minutes = parseInt(timeParts[2]);
        let seconds = parseInt(timeParts[3]);

        updateUptimeDisplay(hours, minutes, seconds);

        setInterval(() => {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
                if (minutes >= 60) {
                    minutes = 0;
                    hours++;
                }
            }
            updateUptimeDisplay(hours, minutes, seconds);
        }, 1000);
    }

    function updateUptimeDisplay(hours, minutes, seconds) {
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('uptimeStat').textContent = formatted;
    }

    function updateStats() {
        document.getElementById('messagesStat').textContent = Math.floor(Math.random() * 10000);
        document.getElementById('usersStat').textContent = Math.floor(Math.random() * 500);
    }

    function updateStatus() {
        fetch('/info')
            .then(response => response.json())
            .then(data => {
                const workersRunning = data.process.workers.length > 0;
                document.getElementById('statusStat').textContent = workersRunning ? 'Online' : 'Offline';
                document.getElementById('statusDetail').textContent = workersRunning ? 'Running' : 'Stopped';

                const statusIcon = document.querySelector('.stat-icon.danger');
                if (workersRunning) {
                    statusIcon.classList.remove('danger');
                    statusIcon.classList.add('success');
                } else {
                    statusIcon.classList.remove('success');
                    statusIcon.classList.add('danger');
                }
            });
    }

    // Init dashboard
    fetchServerInfo();
    updateStats();
    updateStatus();

    setInterval(updateStats, 10000);
    setInterval(fetchServerInfo, 30000);
});

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

    document.querySelector('.nav-item i.fas.fa-file-alt').parentElement.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remove active class from all nav items and add to logs
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    this.classList.add('active');
    
    // Store the header content
    const header = document.querySelector('.header').outerHTML;
    
    // Update main content area
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        ${header}
        <div class="logs-content-container">
            <!-- Logs content will be loaded here -->
            Loading logs...
        </div>
    `;

    // Load logs page content
    fetch('/logs-page')
        .then(response => response.text())
        .then(content => {
            document.querySelector('.logs-content-container').innerHTML = content;
        })
        .catch(error => {
            console.error('Error loading logs:', error);
            document.querySelector('.logs-content-container').innerHTML = 'Error loading logs';
        });
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
                // Update server info
                document.getElementById('nodeVersion').textContent = data.server.nodeVersion;
                document.getElementById('platform').textContent = `${data.os.platform} ${data.os.release}`;
                document.getElementById('cpuCores').textContent = data.os.cpuCount;
                
                // Format memory usage
                const mem = data.server.memoryUsage;
                const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
                const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
                document.getElementById('memoryUsage').textContent = `${usedMB}MB / ${totalMB}MB`;
                
                // Update uptime
                updateUptime(data.server.uptime);
                
                // Update bot status
                const workersRunning = data.process.workers.length > 0;
                document.getElementById('statusStat').textContent = workersRunning ? 'Online' : 'Offline';
                document.getElementById('statusDetail').textContent = workersRunning ? 'Running' : 'Stopped';
                
                // Change status color
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

    // Parse uptime from string and update every second
    function updateUptime(uptimeString) {
        // Extract time parts from the uptime string
        const timeParts = uptimeString.match(/(\d+) hours, (\d+) minutes, (\d+) seconds/);
        if (!timeParts) return;
        
        let hours = parseInt(timeParts[1]);
        let minutes = parseInt(timeParts[2]);
        let seconds = parseInt(timeParts[3]);
        
        // Update the display immediately
        updateUptimeDisplay(hours, minutes, seconds);
        
        // Set up interval to update every second
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

    // Simulate message and user counts (replace with real data)
    function updateStats() {
        // These would ideally come from your backend API
        document.getElementById('messagesStat').textContent = Math.floor(Math.random() * 10000);
        document.getElementById('usersStat').textContent = Math.floor(Math.random() * 500);
    }

    // Check bot status
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

    // Initialize dashboard
    fetchServerInfo();
    updateStats();
    updateStatus();
    
    // Update stats periodically
    setInterval(updateStats, 10000);
    setInterval(fetchServerInfo, 30000);
});

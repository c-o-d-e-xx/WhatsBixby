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

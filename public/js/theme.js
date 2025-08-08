// Theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    
    function setTheme(isDark) {
        document.documentElement.classList.toggle('light', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Check saved theme or prefer color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(prefersDark);
    }
    
    themeToggle.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('light');
        setTheme(!isDark);
    });
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeThemeToggle);

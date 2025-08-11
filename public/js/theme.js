document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');

    function setTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            icon.className = 'fas fa-moon';
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            icon.className = 'fas fa-sun';
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(!isDark);
    });

    // On load, apply saved theme
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme !== 'light'); // Default to dark
});

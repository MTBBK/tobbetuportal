document.getElementById('themeSwitcher').addEventListener('click', () => {
    const body = document.body;
    const currentTheme = body.getAttribute('data-color');
    let newTheme, newIcon;

    switch (currentTheme) {
        case 'light':
            newTheme = 'dark';
			newIcon = '/darkicon.png';
            break;
        case 'dark':
            newTheme = 'fancy';
			newIcon = '/fancyicon.png';
            break;
        case 'fancy':
            newTheme = 'light';
			newIcon = '/lighticon.png';
            break;
        default:
            newTheme = 'dark';
			newIcon = '/darkicon.png';
    }

    applyTheme(newTheme, newIcon);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('icon', newIcon);
});

function applyTheme(theme, icon) {
    document.body.setAttribute('data-color', theme);
    const favicon = document.getElementById('favicon');
    favicon.href = icon;
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedIcon = localStorage.getItem('icon') || '/darkicon.png';
    applyTheme(savedTheme, savedIcon);
});
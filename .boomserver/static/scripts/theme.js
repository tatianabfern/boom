let themeMetadata = null;

async function loadThemeMetadata() {
    if (themeMetadata !== null) return themeMetadata;

    const response = await fetch("static/styles/themes/theme-metadata.json");
    themeMetadata = await response.json();
    return themeMetadata;
}

async function setTheme(themeName) {
    document.getElementById("theme-style").href = `static/styles/themes/${themeName}.css`;

    try {
        const metadata = await loadThemeMetadata();
        const theme = metadata.themes.find(t => t.id === themeName);

        window.currentThemeLanguage = theme?.language || "English";

        if (typeof updateSiteTitle === "function") {
            updateSiteTitle(window.currentThemeLanguage);
        }
    } catch (err) {
        window.currentThemeLanguage = "English";
    }
}

let userSettingsJson = {};

function getUserSettings() {
    const storedSettings = localStorage.getItem("userSettings");

    if (storedSettings !== null) {
        userSettingsJson = JSON.parse(storedSettings);
    }
}

async function setInitalTheme() {
    getUserSettings();

    if (userSettingsJson.theme !== null && userSettingsJson.theme !== undefined) {
        if (userSettingsJson.theme.type == "CUSTOM") {
            // apply custom theme
        }
        else if (userSettingsJson.theme.type == "SAVED") {
            await setTheme(userSettingsJson.theme.id);
        }
    }
    else {
        await setTheme("palenight");
    }
}

setInitalTheme();

function saveTheme(theme) {
    userSettingsJson.theme = theme;

    localStorage.setItem("userSettings",JSON.stringify(userSettingsJson));
}

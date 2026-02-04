let channel;
createChannelConnectionOnPopup();

buildDropdown();

async function buildDropdown() {
    try {
        const response = await fetch('/static/styles/themes/theme-metadata.json');
        const json = await response.json();

        const dropdown = document.getElementById("theme-dropdown");
        dropdown.innerHTML = "";

        for (const theme of json.themes) {
            const option = document.createElement("option");
            option.value = theme.id;
            option.textContent = `${theme.name}`;
            // option.textContent = `${theme.name} — ${theme.author}`;
            dropdown.appendChild(option);
        }

        if (userSettingsJson !== null && userSettingsJson.theme !== undefined) {
            dropdown.value = userSettingsJson.theme.id;
        }
    } catch (error) {
        console.error('Error loading metadata:', error);
    }
}

function handleDropdownChange(themeDropdown) {
    console.log(themeDropdown.value)
    setTheme(themeDropdown.value)
    publishToChannel(themeDropdown.value)
}

window.onload = function() {
    window.addEventListener("message", (event) => {
        const { boomEmoji } = event.data;
        const header = document.getElementById("popup-header");
        header.innerHTML = `${boomEmoji.repeat(3)} BOOM Themes ${boomEmoji.repeat(3)}`;
        const enc = encodeURIComponent(boomEmoji);
        document.body.style.cursor = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ctext y='78' font-size='82'%3E${enc}%3C/text%3E%3C/svg%3E") 16 16, auto`;
    });
}

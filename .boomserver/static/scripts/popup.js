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

    } catch (error) {
        console.error('Error loading metadata:', error);
    }
}

function handleDropdownChange(themeDropdown) {
    console.log(themeDropdown.value)
    setTheme(themeDropdown.value)
    publishToChannel(themeDropdown.value)
}
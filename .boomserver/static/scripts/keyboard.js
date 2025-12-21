document.addEventListener('keydown', function(event) {
    if (event.key === ' ' && fullyLoaded) {
        incrementStateContentRender();
    }

    if (event.key === 'Escape') {
        hideAlert();

        closeLoadingBar();
    }

    if (event.key === 'l' && fullyLoaded) {
        if (holiday === "THANKSGIVING")
            startSeasonalSnowEffect("🍁",{sizeMin: 32, sizeMax: 64});
        
        if (holiday === "CHRISTMAS")
            startSeasonalSnowEffect("❄️");
    }

    if (event.key === "c"  && fullyLoaded) {
        const popup = window.open("popup", "_blank", "width=600,height=400");
        popup.addEventListener("load", () => {
            popup.postMessage(
                { "boomEmoji": boomEmoji },
                "*"
            );
        });
    }

    if (event.key === "b" && fullyLoaded) {
        if (hidden) {
            document.getElementById('all').style.display = 'contents';
            hidden = false;
        } else {
            document.getElementById('all').style.display = 'none';
            hidden = true;
        }
    }

    if (event.key === "p" && fullyLoaded) {
        window.pollDefault = !window.pollDefault;
        Object.keys(window.pollUIState).forEach(key => {
            window.pollUIState[key] = window.pollDefault;
        });
    }
});

let hidden = false;

// alert system for showing errors, and in the future maybe other messages like announcements
function showAlert(headerContent, bodyContent) {
    const alertElement = document.getElementById('alertContainer');
    const alertHeaderElement = document.getElementById('alertHeader');
    const alertBodyElement = document.getElementById('alertBody');

    alertHeaderElement.textContent = headerContent;
    alertBodyElement.textContent = bodyContent;
    alertElement.style.display = 'flex';
}

function hideAlert() {
    const alertElement = document.getElementById('alertContainer');

    alertElement.style.display = 'none';
} 
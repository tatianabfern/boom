let apiKey = null;
let activeUser = null;
let channel;

function logout() {
    apiKey = null;
    activeUser = null;
    eraseCookie('boomToken');
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('helpWrap').style.display = 'none';

    reloadWindow();
}

function backendPasswdCheck(passwd, username=null) {
    return fetch('/boompass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: passwd
        })
    }).then(response => response.json()).then(data => {
        if (data.valid) {
            apiKey = data.key;
            activeUser = data.user || null;

            if (username !== null && activeUser === null) {
                apiKey = null;
                return false;
            }

            return true;
        } else {
            return false;
        }
    }
    ).catch(error => {
        console.error('Error:', error);
        return false;
    }
    );
}

async function checkPassword() {
    let username = document.getElementById('usernameInput').value.toString();
    if (username === "") username=null;

    if (await backendPasswdCheck(CryptoJS.SHA256(document.getElementById('passwordInput').value).toString(), username)) {
        setCookie('boomToken', apiKey, 30);

        loadContent();
    } else {
        alert('Invalid login. Please try again.');
    }
}

function closeLoadingBar() {
    isLoading = false;
    fullyLoaded = true;
    // show page
    document.getElementById('loadingContainer').style.display = 'none';
}

const logView = {
    firstLoad: true,
    order: [],
    hashes: {},
    items: new Map(),
    container: null
};

const chatView = {
    firstLoad: true,
    order: [],
    hashes: {},
    items: new Map(),
    container: null
};

async function loadContent() {
    document.getElementById('passwordContainer').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'flex';
    document.getElementById('helpWrap').style.display = 'block';

    isLoading = true;
    loadProgressBar();

    updateContents();
    setInterval(updateContents, 250);

    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('contentContainer').style.display = 'flex';

    logView.container = document.getElementById('log-file-content');
    chatView.container = document.getElementById('boommeter-file-content');

    Promise.all([
        fetchLogFileContent(),
        fetchBoommeterFileContent(),
        fetchCommandOutput(),
    ]).then(async () => {
        // setInterval(fetchCommandOutput, 15000);
        // setInterval(fetchLogFileContent, 15000);
        // setInterval(fetchBoommeterFileContent, 1000);

        closeLoadingBar();
    });
}

let isLoading = false;

let fullyLoaded = false;

let logsLoaded = false;
let chatLoaded = false;

function loadProgressBar() {
    if (isLoading) {
        let progressCount = 0;

        let element = document.getElementById('loading-bar');
        element.innerHTML = '';

        if (boomEmoji === "")                   progressCount++;
        if (boomLatestContent === "")           progressCount++;
        if (boomFavoriteContent === "")         progressCount++;
        if (boomDroughtContent === "")          progressCount++;
        if (boomBoardAvgSummaryContent === "")  progressCount++;
        if (boomBoardFreqSummaryContent === "") progressCount++;
        if (boomBoardTopContent === "")         progressCount++;
        if (boomBoardDroughtContent === "")     progressCount++;
        if (boomPatchnoteContent === "")        progressCount++;
        if (boomHallContent === "")             progressCount++;
        if (!logsLoaded)                        progressCount++;
        if (!chatLoaded)                        progressCount++;

        barString = "";

        for (i = 0; i < 12; i++) {
            barString += i < progressCount ? "💣" : "💥";
        }

        let barElement = document.createElement('h1');
        barElement.textContent = barString;

        element.appendChild(barElement);
    }
}

function replaceBoomNumbers(input) {
    const regex = /\d+(\.\d+)?💥/g;
    return input.replace(regex, (match) => {
        const numberPart = match.slice(0, -2);
        return `<span class="boom-number"'>${numberPart}  </span>`;
    }
    );
}

async function boomFetch(endpoint, body = {}) {
    body.key = apiKey;

    let retries = 0;
    let data;

    while (true) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        data = await response.json();

        if (response.status != 200 || (data.error && data.error.length > 0)) {
            let err;
            if (response.status != 200) {
                err = response.status;
            }
            else {
                err = data.error
            }

            console.error('Error: ' + err);

            if (response.status === 401) {
                eraseCookie('boomToken');
                showAlert("Token Error","Please reload the boom zone");
                reloadWindow();
            }
            else if (response.status === 504 || response.status === 503) {
                console.error("Timeout Error","The server took too long to respond. Retrying...");
            }
            else {
                showAlert("Error",err);
            }

            // retry request after delay
            retries += 1;
            if (retries > 5) retries = 5;
            await sleep(1000 * retries * retries);

            continue;
        }

        // request successful
        break;
    }

    loadProgressBar();

    // Set active user if unset (api cookie without login)
    let usern = data.user || null;
    if (usern !== "default" && usern !== null) {
      activeUser = usern;
    }

    return data;
}

let boomEmoji = "";
let boomLatestContent = "";
let boomFavoriteContent = "";
let boomDroughtContent = "";
let boomBoardAvgContent = "";
let boomBoardFreqContent = "";
let boomBoardAvgSummaryContent = "";
let boomBoardFreqSummaryContent = "";
let boomBoardTopContent = "";
let boomBoardTopTenContent = "";
let boomBoardDroughtContent = "";
let boomPatchnoteContent = "";
let boomHallContent = "";
let boomGoalState = "";

function getSiteTitle(language = "English") {
    let title = "";
    let emoji = (boomEmoji === "") ? '💥' : `${boomEmoji}`;

    switch (language) {
        case "Chinese (Traditional)":
            (activeUser === null)
                ? title = `${emoji.repeat(5)} 歡迎來到本社<span class="hover-red"> BOOM </span>區！ ${emoji.repeat(5)}`
                : title = `${emoji.repeat(5)} 歡迎來到 ${activeUser} 的<span class="hover-red"> BOOM </span>區！ ${emoji.repeat(5)}`;
            break;
        case "Chinese (Simplified)":
            (activeUser === null)
                ? title = `${emoji.repeat(5)} 欢迎来到本社<span class="hover-red"> BOOM </span>区！ ${emoji.repeat(5)}`
                : title = `${emoji.repeat(5)} 欢迎来到 ${activeUser} 的<span class="hover-red"> BOOM </span>区！ ${emoji.repeat(5)}`;
            break;
        case "Spanish":
            (activeUser === null)
                ? title = `${emoji.repeat(5)} ¡Bienvenido a la zona <span class="hover-red"> BOOM</span>! ${emoji.repeat(5)}`
                : title = `${emoji.repeat(5)} ¡Bienvenido a la zona <span class="hover-red"> BOOM </span> de ${activeUser}! ${emoji.repeat(5)}`
            break;
        case "Turkish":
            (activeUser === null)
                ? title = `${emoji.repeat(5)} <span class="hover-red"> BOOM</span> bölgesine hoş geldiniz! ${emoji.repeat(5)}`
                : title = `${emoji.repeat(5)} ${activeUser}'nin <span class="hover-red"> BOOM </span> bölgesine hoş geldiniz! ${emoji.repeat(5)}`
            break;
        default:
            (activeUser === null)
                ? title = `${emoji.repeat(5)} Welcome to the <span class="hover-red"> BOOM </span> zone! ${emoji.repeat(5)}`
                : title = `${emoji.repeat(5)} Welcome to ${activeUser}'s <span class="hover-red"> BOOM </span> zone! ${emoji.repeat(5)}`;
    }

    return title;
}

function updateSiteTitle(language) {
    document.getElementById("boom-header").innerHTML = getSiteTitle(language);
}

// fetch boom emoji
async function fetchBoomEmoji() {
    const data = await boomFetch("/get_boom_emoji");

    let retVal = data.output;

    boomEmoji = retVal;
    const header = document.getElementById("boom-header");

    header.innerHTML = getSiteTitle(window.currentThemeLanguage || "English");

    const enc = encodeURIComponent(boomEmoji);
    document.body.style.cursor = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ctext y='78' font-size='82'%3E${enc}%3C/text%3E%3C/svg%3E") 16 16, auto`;

    return retVal;
}

// the user with the latest random boom
async function fetchBoomLatest() {
    const data = await boomFetch("/run_boom_latest_command");

    let retVal = data.output;

    boomLatestContent = retVal;

    return retVal;
}

let _boomFavoritePromise = null;

// fetch boombot's favorite user
async function fetchBoomFavorite() {
    if (_boomFavoritePromise) return _boomFavoritePromise;

    _boomFavoritePromise = (async () => {
        const data = await boomFetch("/run_boom_favorite_command");

        const retVal = data.output;
        boomFavoriteContent = retVal;

        const parts = retVal.split(/\s+/);
        boomFavUsername = parts[1] ?? boomFavUsername;

        return retVal;
    })().finally(() => {
        _boomFavoritePromise = null; // allow later refreshes
    });

    return _boomFavoritePromise;
}

// fetch the user with the longest drought
async function fetchBoomDrought() {
    const data = await boomFetch("/run_boom_drought_longest_command");

    let retVal = data.output;

    boomDroughtContent = retVal;

    return retVal;
}

// fetch the command boom average board
async function fetchBoomBoardAvg() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "avg" });

    let retVal = replaceBoomNumbers(data.output);

    boomBoardAvgContent = retVal;

    return retVal;
}

// fetch the command boom average summary board
async function fetchBoomBoardAvgSummary() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "avg-_sitesummary_" });

    let retVal = replaceBoomNumbers(data.output);

    boomBoardAvgSummaryContent = retVal;

    return retVal;
}

// fetch the command boom frequency board
async function fetchBoomBoardFreq() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "freq" });

    let retVal = replaceBoomNumbers(data.output);

    boomBoardFreqContent = retVal;

    return retVal;
}

// fetch the command boom frequency summary board
async function fetchBoomBoardFreqSummary() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "freq-_sitesummary_" });

    let retVal = replaceBoomNumbers(data.output);

    boomBoardFreqSummaryContent = retVal;

    return retVal;
}

// fetch the top 5 command board
async function fetchBoomBoardTop() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "top" });

    let retVal = data.output;

    boomBoardTopContent = retVal;

    return retVal;
}

// fetch the top 10 command board
async function fetchBoomBoardTopTen() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "top-10" });

    let retVal = data.output;

    boomBoardTopTenContent = retVal;

    return retVal;
}

// fetch the boom drought board
async function fetchBoomBoardDrought() {
    const data = await boomFetch("/run_boom_board_command", { boardcmd : "drought" });

    let retVal = replaceBoomNumbers(data.output);

    boomBoardDroughtContent = retVal;

    return retVal;
}

// fetch the boom patch
async function fetchBoomPatch() {
    const data = await boomFetch("/run_boom_patchnotes_current_command");

    let retVal = data.output;

    boomPatchnoteContent = retVal;

    return retVal;
}

// fetch the boom hall
async function fetchBoomHall() {
    const data = await boomFetch("/run_boom_hall_command");

    let retVal = data.output;

    boomHallContent = retVal;

    return retVal;
}

// Generate boom goal thermometer html
function renderThermometer(current, target, percent, end) {
    // Roundabout way of doing this but it works
    const thermoHeight = 296;
    const thermoPad = 5;
    const maxHeight = thermoHeight - thermoPad * 2;
    const innerHeight = maxHeight * .98; // 100% is .98 so exceeding goal overflows tube a little
    const fillHeightPx = Math.floor(innerHeight * percent);
    const heightPct = Math.min(fillHeightPx / maxHeight, 1) * 100;

    const emojiCount = (percent !== 0) ? 14*4 : 0; // This is hard-coded cols*rows amount of emojis - sorry
    const dispDate = new Date(end*1000).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const booms = Array.from(
        { length: emojiCount },
        () => `<span class="boom-goal-emoji">${boomEmoji}</span>`
    ).join("");

    return `
<div class="thermometer" style="height:${thermoHeight}px;"><div class="thermo-fill" style="height:${heightPct}%; padding: ${thermoPad}px ${thermoPad}px;">
<div class="boom-overlay">${booms}</div></div>
</div>
<div>${current} / ${target} (${Math.floor(percent*100)}%)

Ends ${dispDate}</div><br>
`;
}

// fetch the boom goal state
async function fetchBoomGoalState() {
    const data = await boomFetch("/run_boom_goal_command");
    const retVal = data.output.trim();

    if (retVal.startsWith("msg:")) {
        boomGoalState = `<div>${retVal.slice("msg: ".length)}<br></div>`;
        return retVal;
    }

    if (retVal.startsWith("err:")) {
        boomGoalState = `<div>Error: ${retVal.slice("err: ".length)}<br></div>`;
        return retVal;
    }

    const [, curr, goal, end] = retVal.match(/state:\s+(\d+)\s+(\d+)\s+(.+)/);

    const current = parseInt(curr, 10);
    const target  = parseInt(goal, 10);

    const percent = current / target;

    boomGoalState = renderThermometer(current, target, percent, end).trim();

    return retVal;
}

let windowState = {
    contentRenderMode : "cycle", // all, avg, freq, info, goal, cycle
    contentRender : "all" // all, avg, freq, info, goal
}

function contentClick() {
    incrementStateContentRender();
}

function incrementStateContentRender() {
    if (windowState.contentRender == "all")
        windowState.contentRender = "avg"
    else if (windowState.contentRender == "avg")
        windowState.contentRender = "freq"
    else if (windowState.contentRender == "freq")
        windowState.contentRender = "info"
    else if (windowState.contentRender == "info")
        windowState.contentRender = "goal"
    else if (windowState.contentRender == "goal")
        windowState.contentRender = "all"
}

function updateContents() {
    const outputElement = document.getElementById('output');
    let outputText = "";

    if ([ "all", "info", "goal" ].includes(windowState.contentRender)) {
        let username = boomLatestContent.split(" ")[1];
        let className = "";

        if (username) {
            if (username.toLowerCase().includes('bot')) {
                className = 'username-bot';
            } else if (username.includes(boomFavUsername) || boomFavUsername === "everyone") {
                className = 'username-fav';
            } else {
                className = 'username';
            }
        }

        let content = boomLatestContent.replace(username,`<span class="${className}">${username}</span>`);
        outputText += content;
    }
    if ([ "all", "info", "goal" ].includes(windowState.contentRender)) {
        let content = boomFavoriteContent.replace(boomFavUsername,`<span class="username-fav">${boomFavUsername}</span>`);
        outputText += content;
    }
    if ([ "all", "info", "goal" ].includes(windowState.contentRender)) {
        let username = boomDroughtContent.split(" ")[1];
        let className = "";

        if (username) {
            if (username.toLowerCase().includes('bot')) {
                className = 'username-bot';
            } else if (username.includes(boomFavUsername) || boomFavUsername === "everyone") {
                className = 'username-fav';
            } else {
                className = 'username';
            }
        }

        let content = boomDroughtContent.replace(username,`<span class="${className}">${username}</span>`);
        outputText += content;
    }
    if ([ "all", "avg" ].includes(windowState.contentRender)) {
        if (windowState.contentRender === "avg") { // sticky scrolling when table is in focus
            let splitContent = boomBoardAvgContent.split("<br>")

            outputText += `<div class="table-head"><h2 style="text-align: center; width: 100%;">Boom Average</h2><br>${splitContent[1]}<br>${splitContent[2]}</div>`;

            let bodyContent = "";
            for (let i = 3; i < splitContent.length; i++) {
                bodyContent += `${splitContent[i]}<br>`;
            }

            outputText += `<div class="table-body">${bodyContent}</div>`
        }
        else {
            outputText += '<h2 style="text-align: center;">Boom Average</h2>';
            outputText += boomBoardAvgSummaryContent;
        }
    }
    if ([ "all", "freq" ].includes(windowState.contentRender)) {
        if (windowState.contentRender === "freq") { // sticky scrolling when table is in focus
            let splitContent = boomBoardFreqContent.split("<br>")

            outputText += `<div class="table-head"><h2 class="table-title" style="text-align: center; width: 100%;">Boom Frequency</h2><br>${splitContent[1]}<br>${splitContent[2]}</div>`;

            let bodyContent = "";
            for (let i = 3; i < splitContent.length; i++) {
                if (i === splitContent.length - 3) {
                    bodyContent += `${splitContent[i]} <br>`; // fixes single char misalignment
                }
                else {
                    bodyContent += `${splitContent[i]}<br>`;
                }
            }

            outputText += `<div class="table-body">${bodyContent}</div>`
        }
        else {
            outputText += '<h2 style="text-align: center;">Boom Frequency</h2>';
            outputText += boomBoardFreqSummaryContent;
        }
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        outputText += '<h2 style="text-align: center;">Boom Top Commands</h2>';
        if (windowState.contentRender === "all") { // top 10 in info mode
            outputText += boomBoardTopContent;
        }
        else {
            outputText += boomBoardTopTenContent;
        }
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        outputText += '<h2 style="text-align: center;">Boom Drought</h2>';
        outputText += boomBoardDroughtContent;
    }
    if ([ "goal" ].includes(windowState.contentRender)) {
        outputText += '<h2 style="text-align: center;">Boom Goal</h2>';
        outputText += boomGoalState;
    }
    if ([ "all", "info", "goal" ].includes(windowState.contentRender)) {
        outputText += boomPatchnoteContent;
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        outputText += boomHallContent;
    }

    // detectAscii but for string
    outputText = outputText.replace(
      /[^\x00-\x7F]+/g,
      match => `<span class="non-ascii-chars">${match}</span>`
    );

    outputElement.innerHTML = '';
    outputElement.innerHTML = outputText;
}

window.pollDefault = false;
window.pollUIState = {
    // pollId: true | false  (true = open)
};

function detectAscii(obj) {
    if (! /^[\x00-\x7F]*$/.test(obj.textContent)) {
        obj.classList.add('non-ascii-chars')
    }
}

function parsePollLine(line) {
    line = line.trim();

    if (!line.startsWith('[POLL ')) return null;

    // Split into fields
    const parts = line
        .replace(/^\[POLL \d+\]\s*/, '')
        .split(' - ')
        .filter(Boolean);

    // Extract poll ID
    const pollIdMatch = line.match(/\[POLL (\d+)\]/);
    if (!pollIdMatch) return null;

    const pollId = Number(pollIdMatch[1]);
    const createdAt = pollId * 1000;

    const poll = {
        id: pollId,
        title: '',
        flags: [],
        options: [],
        expiresInSeconds: 0,
        voters: []
    };

    if (!(poll.id in window.pollUIState)) {
        window.pollUIState[poll.id] = window.pollDefault;
    }

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part.startsWith('-t ')) {
            poll.title = part.slice(3);
        }
        else if (part.startsWith('-f ')) {
            poll.flags = part.slice(3).split(' ');
        }
        else if (part.startsWith('-o ')) {
            // Format: -o OPT> COUNT [VOTERS...]
            const opt = part.slice(3);
            const [labelPart, rest] = opt.split('>');
            const restParts = rest.trim().split(/\s+/);

            const count = Number(restParts.shift());
            const voters = restParts;

            poll.options.push({
                label: labelPart.trim(),
                count,
                voters
            });
        }
        else if (part.startsWith('-e ')) {
            poll.expiresInSeconds = Number(part.slice(3));
        }
        else if (part.startsWith('-v ')) {
            poll.voters = part.slice(3).split(/\s+/).filter(Boolean);
        }
    }

    // Compute time remaining
    const now = Date.now();
    poll.expiresAt = createdAt + poll.expiresInSeconds * 1000;
    poll.timeRemainingMs = Math.max(0, poll.expiresAt - now);

    return poll;
}

function formatPoll(poll) {
    let output = '  (';
    if (poll.flags.includes('a')) {
      output += "anonymous, ";
    }
    output += poll.flags.includes('m') ? "multi-vote" : "single-vote";
    output += ")\n\n";

    poll.options.forEach(opt => {
        const voteWord = opt.count === 1 ? 'vote' : 'votes';
        const voterStr = opt.voters.length
            ? ` (${opt.voters.join(' ')})`
            : '';
        output += `    ${opt.label}: ${opt.count} ${voteWord}${voterStr}\n`;
    });

    const ms = poll.timeRemainingMs;
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000) % 60;
    const hours = Math.floor(ms / 3600000) % 24;
    const days = Math.floor(ms / 86400000);

    let timeStr = '';
    if (days) timeStr += `${days} day${days !== 1 ? 's' : ''} `;
    if (hours) timeStr += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes) timeStr += `${minutes} minute${minutes !== 1 ? 's' : ''} `;

    // Show seconds only if all larger units are zero
    if (!days && !hours && !minutes) {
        timeStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    if (ms > 0) {
        output += `\nVoting closes in ${timeStr.trim()}`;
    } else {
        output += `\nVoting has closed`;
    }

    return output;
}

function renderPoll(poll) {
    const returnLine = document.createElement('div');
    returnLine.className = 'poll-line';

    const botUser = document.createElement('span');
    botUser.textContent = "pollbot: ";
    botUser.className = 'username-bot';

    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = " 🗳️ ";

    const pollDiv = document.createElement('div');
    pollDiv.className = 'poll';

    const header = document.createElement('div');
    header.textContent = `Poll: ${poll.title}`;

    const body = document.createElement('div');
    body.className = 'poll-body';
    const isOpen = window.pollUIState[poll.id] === true;
    if (!isOpen) {
        body.classList.add('hidden');
    }
    body.textContent = formatPoll(poll);

    pollDiv.addEventListener('click', () => {
        window.pollUIState[poll.id] = body.classList.toggle('hidden') === false;
    });

    pollDiv.appendChild(header);
    pollDiv.appendChild(body);

    returnLine.appendChild(botUser);
    returnLine.appendChild(emojiSpan);
    returnLine.appendChild(pollDiv);

    return returnLine;
}

async function fetchCommandOutput() {
    await Promise.all([
        fetchBoomEmoji(),
        fetchBoomLatest(),
        fetchBoomFavorite(),
        fetchBoomDrought(),
        fetchBoomBoardAvgSummary(),
        fetchBoomBoardFreqSummary(),
        fetchBoomBoardTop(),
        fetchBoomBoardDrought(),
        fetchBoomPatch(),
        fetchBoomHall(),
        fetchBoomBoardAvg(),
        fetchBoomBoardFreq(),
        fetchBoomBoardTopTen(),
        fetchBoomGoalState(),
    ]).then((values) => {
        // console.log(values);
        setTimeout(fetchCommandOutput,7000);
    });
}

function renderLogItem(payload) {
    const line = payload.text;
    const lineElement = document.createElement('div');

    const wordElements = line.split(" ").map(word => {
        const span = document.createElement('span');
        span.textContent = word.trim() + " ";
        detectAscii(span);
        return span;
    });

    const replaceUsername = (index) => {
        const username = wordElements[index]?.textContent.trim() ?? "";
        let className = "";

        if (username.toLowerCase().includes('bot')) className = 'username-bot';
        else if (username.includes(boomFavUsername) || boomFavUsername === "everyone") className = 'username-fav';
        else className = 'username';

        if (wordElements[index]) wordElements[index].className = className;
    };

    if (/\w+ boomed .* for \d+/g.test(line)) replaceUsername(0);
    else if (/.* \w+'s \w+ hit a random boom streak of \d!/g.test(line)) replaceUsername(3);
    else if (/.* \w+ earned a SUPER boom with \dx\d booms on \w+/g.test(line)) replaceUsername(1);
    else if (/.* \w+ is on course for a drought/g.test(line)) replaceUsername(3);
    else if (/.* \w+ imported \d boom.* from/g.test(line)) replaceUsername(1);
    else if (/.* \w+ is chaining boom imports/g.test(line)) replaceUsername(1);
    else if (/.* \w+ boom goal[!.]+ /g.test(line)) replaceUsername(1);

    wordElements.forEach(el => lineElement.appendChild(el));
    return lineElement;
}

function renderChatItem(payload, type='chat') {
    const line = payload.text;
    const lineElement = document.createElement('div');

    let message = '';
    let username = '';
    let usernameElement = null;

    if (line.includes(':')) {
        [username, message] = line.split(/:(.*)/);
        message = message ?? '';

        usernameElement = document.createElement('span');

        if (username.toLowerCase().includes('boombot') ||
            username.toLowerCase().includes('pollbot') ||
            username.toLowerCase().includes('coinbot')) {
            usernameElement.className = 'username-bot';
        } else if (username === boomFavUsername || username === "*" + boomFavUsername || boomFavUsername === "everyone") {
            usernameElement.className = 'username-fav';
        } else {
            usernameElement.className = 'username';
        }

        usernameElement.textContent = username + ': ';
    } else {
        message = line.trim();
    }

    const messageElement = document.createElement('span');
    const words = message.split(' ');

    if (type === 'ascii') {
        messageElement.classList.add('ascii-art')
    }

    words.forEach((word, index) => {
        const wordElement = document.createElement('span');

        // Italicize slash command (2nd word)
        if (index === 1 && word.startsWith('/')) {
            wordElement.style.fontStyle = 'italic';
        }

        // Mention highlighting
        if (/^@[a-zA-Z]+$/.test(word)) {
            if (word.toLowerCase().includes('bot')) {
                wordElement.className = 'username-bot';
            } else if (word === "@" + boomFavUsername || word === "@everyone" || boomFavUsername === "everyone") {
                wordElement.className = 'username-fav';
            } else {
                wordElement.className = 'username';
            }
        }

        wordElement.textContent = word + ' '; // This saves ASCII spacing on accident
        detectAscii(wordElement);
        messageElement.appendChild(wordElement);
    });

    if (usernameElement) {
        lineElement.appendChild(usernameElement);
    }
    lineElement.appendChild(messageElement);

    return lineElement;
}

function renderFileFully(view) {
    const frag = document.createDocumentFragment();

    for (const id of view.order) {
        const item = view.items.get(id);
        if (!item) continue;

        let el;
        if (item.type === 'log') {
            el = renderLogItem(item.payload);
        } else if (item.type === 'chat' || item.type === 'ascii') {
            el = renderChatItem(item.payload, item.type);
        } else if (item.type === 'poll') {
            const poll = parsePollLine(item.payload.text);
            el = poll ? renderPoll(poll) : renderChatItem(item.payload);
        } else {
            el = renderLogItem(JSON.stringify(item.payload));
        }

        frag.appendChild(el);
    }

    view.container.innerHTML = '';
    view.container.appendChild(frag);
}

function applyActions(view, actions) {
    for (const a of actions || []) {
        if (a.op === 'drop') {
            view.items.delete(a.id);
            continue;
        }

        if (a.op === 'append') {
            view.items.set(a.id, { type: a.type, payload: a.payload });

            // Scroll to top when line added
            requestAnimationFrame(() => {
                view.container.scrollTo({top: 0, behavior: 'smooth'});
            });
            continue;
        }

        if (a.op === 'update') {
            const exists = view.items.get(a.id);
            if (exists) {
                view.items.set(a.id, { type: exists.type, payload: a.payload });
            } else {
                // Treat missed update as append
                view.items.set(a.id, { type: a.type ?? 'log', payload: a.payload });
            }
            continue;
        }
    }
}

let boomFavUsername = null;

async function fetchLogFileContent() {
    const data = await boomFetch('/read_log_file', { full: logView.firstLoad, hashes: logView.hashes });
    if (!boomFavUsername) await fetchBoomFavorite();

    if (logView.firstLoad) {
        logView.container.innerHTML = '';
        logView.items.clear();
        logView.firstLoad = false;
        logView.items.set("log-empty", { type: "log", payload: { text: "No users have boomed yet!" } });
    }

    // Change map to represent all IDs
    applyActions(logView, data.actions)

    // Set order from server
    logView.order = data.order || [];
    logView.order = logView.order.length > 0 ? logView.order : ["log-empty"];

    if (data.actions.length > 0) {
        logView.hashes = data.hashes || {};
    }

    // Render each line in order
    renderFileFully(logView)

    logsLoaded = true;
    setTimeout(fetchLogFileContent, 5000);
}

async function fetchBoommeterFileContent() {
    const data = await boomFetch('/read_boommeter_file', { full: chatView.firstLoad, hashes: chatView.hashes });
    if (!boomFavUsername) await fetchBoomFavorite();

    if (chatView.firstLoad) {
        chatView.container.innerHTML = '';
        chatView.items.clear();
        chatView.firstLoad = false;
        chatView.items.set("log-empty", { type: "chat", payload: { text: "No chats to display. Run `chat COMMENT` to start the chat!" } });
    }

    // Change map to represent all IDs
    applyActions(chatView, data.actions)

    // Set order from server
    chatView.order = data.order || [];
    chatView.order = chatView.order.length > 0 ? chatView.order : ["log-empty"];

    if (data.actions.length > 0) {
        chatView.hashes = data.hashes || {};
    }

    // Render each line in order
    renderFileFully(chatView)

    chatLoaded = true;
    setTimeout(fetchBoommeterFileContent, 1000)
}

function reloadWindow() {
    window.location.reload();
    updateSiteTitle(window.currentThemeLanguage || "English");
}

window.onload = async function() {
    await createChannelConnection();

    if (checkCookie('boomToken')) {
        apiKey = getCookie('boomToken');

        loadContent();
    } else {
        document.getElementById('passwordContainer').style.display = 'flex';

        document.getElementById('passwordInput').focus();
        document.getElementById('passwordInput').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                checkPassword();
            }
        });
        document.getElementById('usernameInput').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                checkPassword();
            }
        });
    }
}

window.onerror = function(message, source, lineno, colno, error) {
    console.error("Uncaught Error:", { message, source, lineno, colno, error });
    showAlert("uncaught error",message);
    return true;
};

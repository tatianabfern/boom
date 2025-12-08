let apiKey = null;
let channel;

function backendPasswdCheck(passwd) {
    return fetch('/boompass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: passwd
        })
    }).then(response => response.json()).then(data => {
        if (data.valid) {
            apiKey = data.key;
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
    if (await backendPasswdCheck(CryptoJS.SHA256(document.getElementById('passwordInput').value).toString())) {
        setCookie('boomToken', apiKey, 30);

        loadContent();
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function closeLoadingBar() {
    isLoading = false;
    fullyLoaded = true;
    // show page
    document.getElementById('loadingContainer').style.display = 'none';
}

async function loadContent() {
    document.getElementById('passwordContainer').style.display = 'none';
    isLoading = true;
    loadProgressBar();

    updateContents();
    setInterval(updateContents, 250);

    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('contentContainer').style.display = 'flex';

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
        
        for (i =0; i < 12; i++) {
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
    
        data = response.json();
    
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
                window.location.reload()
            }
            else if (response.status === 504 || response.status === 503) {
                console.error("Timeout Error","The server took too long to respond. Retrying...");
            }
            else {
                showAlert("Error",err);
            }

            // retry request after delay
            retries += 1;
            sleep(1000 * retries * retries);

            continue;
        }

        // request successful
        break;
    }

    loadProgressBar();

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

// fetch boom emoji
async function fetchBoomEmoji() {
    const data = await boomFetch("/get_boom_emoji");

    let retVal = data.output;

    boomEmoji = retVal;
    const header = document.getElementById("boom-header");
    header.innerHTML = `${boomEmoji.repeat(5)} Welcome to the <span class="hover-red"> BOOM </span> zone! ${boomEmoji.repeat(5)}`;
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

// fetch boombot's favorite user
async function fetchBoomFavorite() {
    const data = await boomFetch("/run_boom_favorite_command");

    let retVal = data.output;

    boomFavoriteContent = retVal;

    boomFavUsername = retVal.split(" ")[1];
    
    return retVal;
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

let windowState = {
    contentRenderMode : "cycle", // all, avg, freq, info, cycle
    contentRender : "all" // all, avg, freq, info
}

function contentClick() {
    console.log("click");
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
        windowState.contentRender = "all"
}

function updateContents() {
    const outputElement = document.getElementById('output');
    let outputText = "";

    if ([ "all", "info" ].includes(windowState.contentRender)) {
        let username = boomLatestContent.split(" ")[1];
        let className = "";
        
        if (username) {
            if (username.toLowerCase().includes('bot')) {
                className = 'username-bot';
            } else if (username.includes(boomFavUsername)) {
                className = 'username-fav';
            } else {
                className = 'username';
            }
        }

        let content = boomLatestContent.replace(username,`<span class="${className}">${username}</span>`);
        outputText += content;
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        let content = boomFavoriteContent.replace(boomFavUsername,`<span class="username-fav">${boomFavUsername}</span>`);
        outputText += content;
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        let username = boomDroughtContent.split(" ")[1];
        let className = "";
        
        if (username) {
            if (username.toLowerCase().includes('bot')) {
                className = 'username-bot';
            } else if (username.includes(boomFavUsername)) {
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

            outputText += `<div class="table-head"><h2 style="text-align: center;">Boom Average</h2><br>${splitContent[1]}<br>${splitContent[2]}</div>`;
            
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

            outputText += `<div class="table-head"><h2 style="text-align: center;">Boom Frequency</h2><br>${splitContent[1]}<br>${splitContent[2]}</div>`;
            
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
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        outputText += boomPatchnoteContent;
    }
    if ([ "all", "info" ].includes(windowState.contentRender)) {
        outputText += boomHallContent;
    }

    outputElement.innerHTML = '';
    outputElement.innerHTML = outputText;
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
    ]).then((values) => {
        // console.log(values);
        setTimeout(fetchCommandOutput,10000);
    });
}

async function fetchLogFileContent() {
    const data = await boomFetch('/read_log_file');

    // Clear previous content
    const fileContentElement = document.getElementById('log-file-content');
    fileContentElement.innerHTML = '';

    if (data.lines) {
        data.lines.forEach(line => {
            const lineElement = document.createElement('div');

            let wordElements = line.split(" ").map((word, _index, _array) => {
                let span = document.createElement('span');
                span.textContent = word.trim() + " ";
                return span;
            });

            let replaceUsername = (index) => {
                let username = wordElements[index].textContent.trim();
                let className = "";

                if (username.toLowerCase().includes('bot')) {
                    className = 'username-bot';
                } else if (username.includes(boomFavUsername)) {
                    className = 'username-fav';
                } else {
                    className = 'username';
                }

                wordElements[index].className = className;
            }

            if (/\w+ boomed .* for \d+/g.test(line)) {
                replaceUsername(0);
            } else if (/.* \w+'s \w+ hit a random boom streak of \d!/g.test(line)) {
                replaceUsername(3);
            } else if (/.* \w+ earned a SUPER boom with \dx\d booms on \w+/g.test(line)) {
                replaceUsername(1);
            } else if (/.* \w+ is on course for a drought/g.test(line)) {
                replaceUsername(3);
            } else if (/.* \w+ imported \d boom.* from/g.test(line)) {
                replaceUsername(1);
            } else if (/.* \w+ is chaining boom imports/g.test(line)) {
                replaceUsername(1);
            }

            for (let wordElement of wordElements) {
                lineElement.appendChild(wordElement);
            }
            // lineElement.textContent = lineText;
            fileContentElement.appendChild(lineElement);
        }
        );
    }

    setTimeout(fetchLogFileContent,5000);
    
    logsLoaded = true;
}

let boomFavUsername = "1234567890";

async function fetchBoommeterFileContent() {
    const data = await boomFetch('/read_boommeter_file');

    // Clear previous content
    const fileContentElement = document.getElementById('boommeter-file-content');
    fileContentElement.innerHTML = '';

    if (data.lines) {
        data.lines.forEach(line => {
            const lineElement = document.createElement('div');
            let message = '';
            let username = '';
            let usernameElement = null;

            if (line.includes(':')) {
                [username,message] = line.split(/:(.+)/);
                usernameElement = document.createElement('span');
                if (username.toLowerCase().includes('boombot')) {
                    usernameElement.className = 'username-bot';
                } else if (username === boomFavUsername || username === "*" + boomFavUsername) {
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

            words.forEach( (word, index) => {
                const wordElement = document.createElement('span');
                if (index === 1 && word.startsWith('/')) {
                    wordElement.style.fontStyle = 'italic';
                }
                if (/^@[a-zA-z]+$/.test(word)) {
                    if (word.toLowerCase().includes('bot')) {
                        wordElement.className = 'username-bot';
                    } else if (word === "@" + boomFavUsername) {
                        wordElement.className = 'username-fav';
                    } else {
                        wordElement.className = 'username';
                    }
                }
                wordElement.textContent = word + ' ';
                messageElement.appendChild(wordElement);
            }
            );
            if (usernameElement != null) {
                lineElement.appendChild(usernameElement);
            }
            lineElement.appendChild(messageElement);
            fileContentElement.appendChild(lineElement);
        }
        );
    }

    setTimeout(fetchBoommeterFileContent,1000)
    
    chatLoaded = true;
}

window.onload = function() {
    createChannelConnection();

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
    }
}

window.onerror = function(message, source, lineno, colno, error) {
    console.error("Uncaught Error:", { message, source, lineno, colno, error });
    showAlert("uncaught error",message);
    return true;
};
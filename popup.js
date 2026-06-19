// const elements = [
//     "#comments",
//     "#related",
//     "#subscribe-button",
//     "#notification-button",
//     "like-button-view-model",
//     "ytd-reel-shelf-renderer",
//     "ytd-rich-grid-renderer",
//     "ytd-browse[page-subtype='home'] #contents"
// ];

// function hideDistractions() {
//     chrome.storage.local.get("focusMode", (data) => {
//         if (data.focusMode === false) {
//             // Only reset specific elements — not all
//             elements.forEach((selector) => {
//                 document.querySelectorAll(selector).forEach((el) => {
//                     el.style.display = "";
//                 });
//             });
//             return;
//         }

//         // Hide all distraction elements
//         elements.forEach((selector) => {
//             document.querySelectorAll(selector).forEach((el) => {
//                 el.style.display = "none";
//             });
//         });
//     });
// }

// setInterval(hideDistractions, 1000);



// ---- FOCUS TOGGLE ----
const button = document.getElementById("toggleBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
let enabled = true;

function updateStatus(isEnabled) {
    if (isEnabled) {
        statusDot.className = "dot green";
        statusText.innerText = "Focus is ON";
        button.innerText = "Disable Focus";
    } else {
        statusDot.className = "dot red";
        statusText.innerText = "Focus is OFF";
        button.innerText = "Enable Focus";
    }
}

chrome.storage.local.get("focusMode", (data) => {
    enabled = data.focusMode !== false;
    updateStatus(enabled);
});

button.addEventListener("click", () => {
    enabled = !enabled;
    chrome.storage.local.set({ focusMode: enabled });
    updateStatus(enabled);
});

// ---- DARK MODE ----
const darkBtn = document.getElementById("darkBtn");

chrome.storage.local.get("darkMode", (data) => {
    if (data.darkMode === true) {
        document.body.classList.add("dark");
        darkBtn.innerText = "Light Mode";
    }
});

darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    chrome.storage.local.set({ darkMode: isDark });
    darkBtn.innerText = isDark ? "Light Mode" : "Dark Mode";
});

// ---- TIMER ----
const timer = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const sessionCount = document.getElementById("sessionCount");
const totalTime = document.getElementById("totalTime");
const focusScore = document.getElementById("focusScore");

// Load session stats
chrome.storage.local.get(["sessions", "totalMins"], (data) => {

    const sessions = data.sessions || 0;
    const mins = data.totalMins || 0;

    sessionCount.innerText = sessions;
    totalTime.innerText = mins;

    const score = Math.min(100, sessions * 10);

    focusScore.innerText = score;

});

// LOAD CURRENT TIMER STATE from background
function updateTimerDisplay() {
    chrome.storage.local.get(["timerLeft", "timerRunning"], (data) => {
        const t = data.timerLeft !== undefined ? data.timerLeft : 0.5 * 60;
        const mins = Math.floor(t / 60);
        const secs = t % 60;
        timer.innerText = `${mins}:${secs < 10 ? "0" + secs : secs}`;
    });
}

// Update display every second when popup is open
updateTimerDisplay();
setInterval(updateTimerDisplay, 1000);

// START
startBtn.addEventListener("click", () => {
    chrome.storage.local.get("timerLeft", (data) => {
        const t = data.timerLeft !== undefined ? data.timerLeft : 0.5 * 60;
        chrome.runtime.sendMessage({ type: "START_TIMER", timeLeft: t });
    });
});

// STOP
stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "STOP_TIMER" });
});

// RESET
resetBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "RESET_TIMER" });
    timer.innerText = "00:30";
});

// Listen for timer done — update sessions
chrome.storage.onChanged.addListener((changes) => {
    if (changes.timerRunning && changes.timerRunning.newValue === false) {
        chrome.storage.local.get(["sessions", "totalMins", "timerLeft"], (data) => {
            if (data.timerLeft === 0) {
                const newSessions = (data.sessions || 0) + 1;
                const newMins = (data.totalMins || 0) + 25;
                chrome.storage.local.set({
                    sessions: newSessions,
                    totalMins: newMins
                });
                sessionCount.innerText = newSessions;
                totalTime.innerText = newMins;
            }
        });
    }
});


// ---- KEYWORDS (chip style) ----
const keywordInput = document.getElementById("keywordInput");
const addKeywordBtn = document.getElementById("addKeywordBtn");
const keywordList = document.getElementById("keywordList");
const keywordTitle = document.getElementById("keywordTitle");

addKeywordBtn.addEventListener("click", () => {
    const keyword = keywordInput.value.trim().toLowerCase();

    if (!keyword) return;
    chrome.storage.local.get("customKeywords", (data) => {
        const keywords = data.customKeywords || [];

        // Prevent duplicates
        if (keywords.includes(keyword)) {
            alert("Keyword already exists!");
            return;
        }

        keywords.push(keyword);

        chrome.storage.local.set({
            customKeywords: keywords
        });
        keywordInput.value = "";
        loadKeywords();
    });
});

function loadKeywords() {
    chrome.storage.local.get("customKeywords", (data) => {

        const keywords = data.customKeywords || [];
        keywordTitle.innerText = `Saved Keywords (${keywords.length})`;

        keywordList.innerHTML = "";

        keywords.forEach((keyword) => {
            const li = document.createElement("li");

            const textSpan = document.createElement("span");
            textSpan.className = "keyword-text";
            textSpan.title = keyword; // full text on hover if truncated
            textSpan.innerText = keyword;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "deleteBtn";
            deleteBtn.innerText = "✕";
            deleteBtn.setAttribute("aria-label", `Remove ${keyword}`);

            deleteBtn.addEventListener("click", () => {
                const updatedKeywords = keywords.filter(
                    (k) => k !== keyword
                );
                chrome.storage.local.set({
                    customKeywords: updatedKeywords
                });
                loadKeywords();
            });

            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            keywordList.appendChild(li);
        });
    });
}

loadKeywords();
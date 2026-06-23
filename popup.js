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
   // ________________________________________________
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
// Step 1: Read the subject from the dropdown (#subjectSelect in popup.html)
// Step 2: Save it to Chrome storage as "currentSubject"
//         — background.js will read this when the timer finishes
// Step 3: Send START_TIMER message to background.js to begin the countdown
startBtn.addEventListener("click", () => {
    const subject = document.getElementById("subjectSelect").value;
    // Save selected subject so background.js knows which subject to add mins to
    chrome.storage.local.set({ currentSubject: subject });

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


// ---- CHANNEL BLOCKING (chip style) ----Lines 232–288
// 1 . addChannelBtn click handler — when you type a channel name and click "Add Channel", it saves to chrome.storage.local under key blockedChannels
// 2 . loadChannels() function — reads saved channels and renders them as chips (same pill style as keywords), each with a ✕ delete button
// 3 . loadChannels() call — runs once on popup open to show already-saved channels
const channelInput = document.getElementById("channelInput");
const addChannelBtn = document.getElementById("addChannelBtn");
const channelList = document.getElementById("channelList");
const channelTitle = document.getElementById("channelTitle");

addChannelBtn.addEventListener("click", () => {
    const channel = channelInput.value.trim().toLowerCase();
    if (!channel) return;

    chrome.storage.local.get("blockedChannels", (data) => {
        const channels = data.blockedChannels || [];

        if (channels.includes(channel)) {
            alert("Channel already blocked!");
            return;
        }

        channels.push(channel);
        chrome.storage.local.set({ blockedChannels: channels });
        channelInput.value = "";
        loadChannels();
    });
});

function loadChannels() {
    chrome.storage.local.get("blockedChannels", (data) => {
        const channels = data.blockedChannels || [];
        channelTitle.innerText = `Blocked Channels (${channels.length})`;
        channelList.innerHTML = "";

        channels.forEach((channel) => {
            const li = document.createElement("li");

            const textSpan = document.createElement("span");
            textSpan.className = "keyword-text";
            textSpan.title = channel;
            textSpan.innerText = channel;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "deleteBtn";
            deleteBtn.innerText = "✕";
            deleteBtn.setAttribute("aria-label", `Remove ${channel}`);

            deleteBtn.addEventListener("click", () => {
                const updated = channels.filter((c) => c !== channel);
                chrome.storage.local.set({ blockedChannels: updated });
                loadChannels();
            });

            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            channelList.appendChild(li);
        });
    });
}

loadChannels();


// ---- WEEKLY STATS CHART ----
// This function reads last 7 days study data from Chrome storage
// and draws a bar chart inside #weeklyChart in popup.html
// It also calculates the streak (how many days in a row the student studied)

function loadWeeklyStats() {
    chrome.storage.local.get("weeklyData", (data) => {
        // weeklyData looks like: { "2026-06-21": { mins: 50 }, "2026-06-20": { mins: 25 } }
        const weeklyData = data.weeklyData || {};

        // Step 1: Build an array of last 7 days
        // i=6 means 6 days ago, i=0 means today
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);               // go back i days from today
            const key = d.toISOString().split("T")[0]; // "2026-06-21" — matches key saved in background.js
            const label = d.toLocaleDateString("en", { weekday: "short" }); // "Mon", "Tue" etc.
            const mins = (weeklyData[key] || {}).mins || 0; // mins studied that day (0 if none)
            days.push({ key, label, mins });
        }
        // days = [ {label:"Mon", mins:0}, {label:"Tue", mins:25}, ... {label:"Sun", mins:50} ]

        // Step 2: Find tallest bar so all bars scale relative to it
        const maxMins = Math.max(...days.map((d) => d.mins), 25);
        // minimum 25 so chart doesn't look flat when no data yet

        // Step 3: Draw the 7 bars inside #weeklyChart
        const chart = document.getElementById("weeklyChart");
        chart.innerHTML = ""; // clear old bars before redrawing

        days.forEach((day) => {
            // Bar height as a % of the tallest bar
            const heightPercent = Math.round((day.mins / maxMins) * 100);

            // Each column = mins label on top + bar + day label below
            const col = document.createElement("div");
            col.className = "chart-col";

            // Shows "50m" above the bar — empty if 0 mins (cleaner look)
            const minsLabel = document.createElement("div");
            minsLabel.className = "bar-mins";
            minsLabel.innerText = day.mins > 0 ? `${day.mins}m` : "";

            // The actual colored bar — height is controlled by CSS %
            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.style.height = `${heightPercent}%`;

            // "Mon", "Tue" etc. shown below the bar
            const dayLabel = document.createElement("div");
            dayLabel.className = "bar-label";
            dayLabel.innerText = day.label;

            col.appendChild(minsLabel);
            col.appendChild(bar);
            col.appendChild(dayLabel);
            chart.appendChild(col);
        });

        // Step 4: Calculate streak — consecutive days from TODAY going backwards
        // Example: today=25m, yesterday=50m, 2 days ago=0m → streak = 2
        let streak = 0;
        for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].mins > 0) streak++;
            else break; // stop the moment we hit a day with 0 mins
        }
        document.getElementById("streakBadge").innerText =
            `🔥 Streak: ${streak} day${streak !== 1 ? "s" : ""} in a row!`;
    });
}

// Run once when popup opens to show the chart immediately
loadWeeklyStats();


// ---- SUBJECT STATS ----
// Reads subjectData from Chrome storage and draws one bar row per subject
// subjectData looks like: { "Physics": 75, "Maths": 50, "DSA": 25 }
// This data is saved by background.js when each timer session finishes

function loadSubjectStats() {
    chrome.storage.local.get("subjectData", (data) => {
        const subjectData = data.subjectData || {};
        // Convert object to array: [["Physics", 75], ["Maths", 50], ...]
        const entries = Object.entries(subjectData);

        const container = document.getElementById("subjectStats");
        container.innerHTML = ""; // clear before redrawing

        if (entries.length === 0) {
            // No sessions done yet — show a hint message
            container.innerHTML = "<p class='no-subjects'>No sessions yet. Pick a subject and start!</p>";
            return;
        }

        // Find the highest mins to scale all bars relative to it
        const maxMins = Math.max(...entries.map(([, mins]) => mins));

        // Sort: most studied subject appears first
        entries.sort((a, b) => b[1] - a[1]);

        entries.forEach(([subject, mins]) => {
            // Bar width as % of the most-studied subject
            const widthPercent = Math.round((mins / maxMins) * 100);

            // Each row: subject name | ████ bar | 75m
            const row = document.createElement("div");
            row.className = "subject-row-stat";

            // Subject name on the left e.g. "Physics"
            const label = document.createElement("div");
            label.className = "subject-label";
            label.innerText = subject;

            // Grey track that holds the colored bar
            const barWrap = document.createElement("div");
            barWrap.className = "subject-bar-wrap";

            // Colored bar — width set by widthPercent
            const bar = document.createElement("div");
            bar.className = "subject-bar";
            bar.style.width = `${widthPercent}%`;

            // "75m" text on the right
            const minsText = document.createElement("div");
            minsText.className = "subject-mins";
            minsText.innerText = `${mins}m`;

            barWrap.appendChild(bar);
            row.appendChild(label);
            row.appendChild(barWrap);
            row.appendChild(minsText);
            container.appendChild(row);
        });
    });
}

// Run once when popup opens
loadSubjectStats();

// Refresh both charts whenever background.js saves new data after a session ends
// Connection: background.js saves weeklyData + subjectData → storage fires → both update
chrome.storage.onChanged.addListener((changes) => {
    if (changes.weeklyData)  loadWeeklyStats();
    if (changes.subjectData) loadSubjectStats();
});

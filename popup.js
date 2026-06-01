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

let timeLeft = 0.5*60; // change to 25 * 60 after testing
let interval;

chrome.storage.local.get(["sessions", "totalMins"], (data) => {
    sessionCount.innerText = data.sessions || 0;
    totalTime.innerText = data.totalMins || 0;
});

startBtn.addEventListener("click", () => {
    clearInterval(interval);
    interval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        if (seconds < 10) seconds = "0" + seconds;
        timer.innerText = `${minutes}:${seconds}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(interval);
            timer.innerText = "Time's Up!";

            // Send to background — background handles notification + banner
            chrome.runtime.sendMessage({ type: "TIMER_DONE" });

            chrome.storage.local.get(["sessions", "totalMins"], (data) => {
                const newSessions = (data.sessions || 0) + 1;
                const newMins = (data.totalMins || 0) + 25;
                chrome.storage.local.set({
                    sessions: newSessions,
                    totalMins: newMins
                });
                sessionCount.innerText = newSessions;
                totalTime.innerText = newMins;
            });
        }
    }, 1000);
});

stopBtn.addEventListener("click", () => { clearInterval(interval); });

resetBtn.addEventListener("click", () => {
    clearInterval(interval);
    timeLeft = 1 * 60; // change to 25 * 60 after testing
    timer.innerText = "01:00";
});

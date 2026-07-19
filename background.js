// Pomodoro Timer
// Pomodoro timer (runs in background)	background.js
// Subject tagging + stats	popup.js + background.js
// background.js → reads storage → saves after timer ends

// ________________________________________________________
let timerInterval = null;
let timeLeft = 0.5 * 60;
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "START_TIMER") {
        if (isRunning) return;
        isRunning = true;
        timeLeft = message.timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            chrome.storage.local.set({ timerLeft: timeLeft, timerRunning: true });

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                chrome.storage.local.set({ timerLeft: 0, timerRunning: false });

                // ---- WEEKLY STATS: Save today's study mins when timer finishes ----
                // Get today's date as a string key like "2026-06-21"
                // This key is used to store how many mins the student studied today
                const today = new Date().toISOString().split("T")[0];

                chrome.storage.local.get("weeklyData", (res) => {
                    const weeklyData = res.weeklyData || {};
                    // If today has no entry yet, start at 0
                    const todayEntry = weeklyData[today] || { mins: 0 };
                    // Add 25 mins for this completed Pomodoro session
                    todayEntry.mins += 25;
                    weeklyData[today] = todayEntry;
                    // Save updated weekly data back to Chrome storage
                    chrome.storage.local.set({ weeklyData });
                });
                // ---- END WEEKLY STATS ----

                // ---- SUBJECT TAGGING: Add 25 mins to the subject the student was studying ----
                // popup.js saved currentSubject to storage when Start was clicked
                // Now we read it here and update that subject's total mins
                chrome.storage.local.get(["currentSubject", "subjectData"], (res) => {
                    const subject = res.currentSubject || "Other"; // default to "Other" if nothing was selected
                    const subjectData = res.subjectData || {};     // e.g. { "Physics": 50, "Maths": 25 }
                    // Add 25 mins to this subject — if subject is new, start from 0
                    subjectData[subject] = (subjectData[subject] || 0) + 25;
                    // Save back so popup.js can read and show the updated bars
                    chrome.storage.local.set({ subjectData });
                });
                // ---- END SUBJECT TAGGING ----

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "YouTube Focus Mode",
                    message: "Time's Up! Take a 5 minute break!"
                });

                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        if (tab.url && tab.url.includes("youtube.com")) {
                            chrome.tabs.sendMessage(tab.id, { type: "TIMER_DONE" });
                        }
                    });
                });
            }
        }, 1000);
    }

    if (message.type === "STOP_TIMER") {
        clearInterval(timerInterval);
        isRunning = false;
        chrome.storage.local.set({ timerRunning: false });
    }

    if (message.type === "RESET_TIMER") {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = 0.5 * 60;
        chrome.storage.local.set({ timerLeft: 0.5 * 60, timerRunning: false });
    }
});
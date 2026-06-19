let timerInterval = null;
let timeLeft =  0.5 * 60;
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
        timeLeft = 0.5* 60;
        chrome.storage.local.set({ timerLeft: 0.5 * 60, timerRunning: false });
    }
});

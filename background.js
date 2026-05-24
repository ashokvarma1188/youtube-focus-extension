chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TIMER_DONE") {
        // Show browser notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "YouTube Focus Mode",
            message: "Time's Up! Take a 5 minute break!"
        });

        // Send banner to YouTube tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url && tab.url.includes("youtube.com")) {
                    chrome.tabs.sendMessage(tab.id, { type: "TIMER_DONE" });
                }
            });
        });
    }
});

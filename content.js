if (typeof chrome === "undefined" || !chrome.storage) {
    console.log("Extension reloaded — refresh YouTube tab");
} else {
    const elements = [
        "#comments",
        "#related",
        "#subscribe-button",
        "#notification-button",
        "like-button-view-model",
        "ytd-reel-shelf-renderer"
    ];

    function hideDistractions() {
        chrome.storage.local.get("focusMode", (data) => {
            if (data.focusMode === false) {
                elements.forEach((selector) => {
                    document.querySelectorAll(selector).forEach((el) => {
                        el.style.display = "";
                    });
                });
                return;
            }
            elements.forEach((selector) => {
                document.querySelectorAll(selector).forEach((el) => {
                    el.style.display = "none";
                });
            });
        });
    }

    function showTimerAlert() {
        const banner = document.createElement("div");
        banner.innerText = "Time's Up! Take a 5 minute break!";
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1a73e8;
            color: white;
            padding: 16px 32px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 99999;
        `;
        document.body.appendChild(banner);
        setTimeout(() => { banner.remove(); }, 5000);
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "TIMER_DONE") {
            showTimerAlert();
        }
    });

    setInterval(hideDistractions, 1000);
}


function hideDistractions() {

    chrome.storage.local.get("focusMode", (data) => {

        if (data.focusMode === false) {

            document.querySelectorAll("*").forEach((el) => {
                el.style.display = "";
            });

            return;
        }

        const elements = [
            "#comments",
            "#related",
            "#subscribe-button",
            "#notification-button",
            "like-button-view-model",
            "ytd-reel-shelf-renderer"
        ];

        elements.forEach((selector) => {

            document.querySelectorAll(selector).forEach((el) => {
                el.style.display = "none";
            });

        });

    });
}

setInterval(hideDistractions, 1000);



// function hideDistractions() {

//     // Hide comments
//     const comments = document.querySelector("#comments");

//     if (comments) {
//         comments.style.display = "none";
//     }

//     // Hide recommended videos
//     const related = document.querySelector("#related");

//     if (related) {
//         related.style.display = "none";
//     }

//     // Hide like button
//     const likes = document.querySelector("like-button-view-model");

//     if (likes) {
//         likes.style.display = "none";
//     }

//     // Hide subscribe button
//     const subscribe = document.querySelector("#subscribe-button");

//     if (subscribe) {
//         subscribe.style.display = "none";
//     }

//     // Hide notifications bell
//     const notification = document.querySelector("#notification-button");

//     if (notification) {
//         notification.style.display = "none";
//     }

//     // Hide shorts
//     const shorts = document.querySelector("ytd-reel-shelf-renderer");

//     if (shorts) {
//         shorts.style.display = "none";
//     }
// }

// setInterval(hideDistractions, 1000);
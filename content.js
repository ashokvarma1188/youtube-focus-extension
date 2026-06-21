if (typeof chrome === "undefined" || !chrome.storage) {
    console.log("Extension reloaded — refresh YouTube tab");
} else {


    //  Distraction Hiding
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

    const blockKeywords = [
        // Songs & Music
        "song", "songs", "music video", "official video",
        "official audio", "lyrics", "lyric video",
        "telugu song", "hindi song", "tamil song",
        "remix", "dance", "bhajan", "audio",
        "full video", "full video song", "video song",
        "vevo", "t-series", "lahari music",

        // Movies
        "full movie", "movie scene", "movie trailer",
        "web series", "episode", "short film",
        "dubbed movie", "ott release",
        "8k video", "4k video",

        // Entertainment
        "prank", "roast", "bigg boss",
        "ipl highlights", "cricket highlights",
        "pubg", "free fire", "gameplay",
        "tiktok compilation", "reels compilation",
        "meet bros", "sunny leone",
        "dandelions", "magadheera"
    ];

    // Build one shared regex list once per run instead of re-creating
    // a new RegExp for every keyword on every single card (faster).
    //
    // For multi-word keywords (e.g. "ram charan"), titles often write it
    // as one squished word ("Ramcharan") or in a hashtag ("#ramcharan").
    // So for any keyword containing a space, we generate TWO patterns:
    //   1. the normal phrase with word boundaries: \bram charan\b
    //   2. the same phrase with spaces removed: \bramcharan\b
    // Both get checked — if either matches, it's a hit.
    function getAllKeywordRegexes(customKeywords) {
        const allKeywords = [...blockKeywords, ...customKeywords];
        const regexes = [];

        allKeywords.forEach((keyword) => {
            const trimmed = keyword.trim();
            if (!trimmed) return;

            // normal version, e.g. "ram charan"
            regexes.push(new RegExp(`\\b${escapeRegex(trimmed)}\\b`, "i"));

            // squished version, only if it actually has a space
            if (trimmed.includes(" ")) {
                const squished = trimmed.replace(/\s+/g, "");
                regexes.push(new RegExp(`\\b${escapeRegex(squished)}\\b`, "i"));
            }
        });

        return regexes;
    }

    // Escape special regex characters in user-typed keywords so things
    // like "c++" or "4k)" don't crash the regex engine.
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function isDistractionTitle(title, regexes) {
        return regexes.some((regex) => regex.test(title));
    }

    // Read ALL visible text inside a card (title + channel name +
    // description snippet), not just the title. This catches cases like
    // "Dookudu: Dethadi HD" whose title doesn't say "Mahesh Babu" but
    // whose description does.
    function getCardText(card, titleSelector) {
        const titleEl = card.querySelector(titleSelector);
        if (!titleEl) return null;
        // card.innerText pulls in title + channel + description + chapters etc.
        return (card.innerText || titleEl.innerText || "").toLowerCase();
    }

    function filterRelatedVideos(regexes) {
        const videoCards = document.querySelectorAll("ytd-compact-video-renderer");
        videoCards.forEach((card) => {
            const text = getCardText(card, "#video-title");
            if (text === null) return;
            card.style.display = isDistractionTitle(text, regexes) ? "none" : "";
        });
    }

    function filterHomePageVideos(regexes) {
        const homeCards = document.querySelectorAll("ytd-rich-item-renderer");
        homeCards.forEach((card) => {
            const text = getCardText(card, "#video-title");
            if (text === null) return;
            card.style.display = isDistractionTitle(text, regexes) ? "none" : "";
        });
    }

    function filterSearchResults(regexes) {
        const searchCards = document.querySelectorAll("ytd-video-renderer");
        searchCards.forEach((card) => {
            const text = getCardText(card, "#video-title");
            if (text === null) return;
            card.style.display = isDistractionTitle(text, regexes) ? "none" : "";
        });
    }

    // Shorts cards don't use #video-title like normal videos.
    // We try a couple of known selectors and fall back to the card's
    // visible text if none match, so this keeps working even if
    // YouTube tweaks class names again.
    function getShortsTitle(card) {
        const titleEl =
            card.querySelector("h3") ||
            card.querySelector("[class*='title']") ||
            card.querySelector("span");
        if (titleEl && titleEl.innerText) {
            return titleEl.innerText.toLowerCase();
        }
        // fallback: use whatever text is in the card
        return (card.innerText || "").toLowerCase();
    }

    function filterShortsResults(regexes) {
        // current selector (Jan 2026) — old "ytm-shorts-lockup-view-model"
        // (without -v2) is outdated and no longer matches anything.
        const shortsCards = document.querySelectorAll(
            "ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model"
        );

        shortsCards.forEach((card) => {
            const title = getShortsTitle(card);
            if (!title) return;
            card.style.display = isDistractionTitle(title, regexes) ? "none" : "";
        });
    }

    // getChannelName() — reads the channel name from a video card
    function getChannelName(card) {
        const el =
            card.querySelector("ytd-channel-name #text") ||
            card.querySelector("#channel-name #text") ||
            card.querySelector("ytd-channel-name");
        return el ? el.innerText.trim().toLowerCase() : "";
    }

    // filterByChannel() — hides cards whose channel matches your blocked list
    function filterByChannel(blockedChannels) {
        if (!blockedChannels || blockedChannels.length === 0) return;

        const allCards = document.querySelectorAll(
            "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer"
        );

        allCards.forEach((card) => {
            const channelName = getChannelName(card);
            if (!channelName) return;

            const isBlocked = blockedChannels.some((ch) => channelName.includes(ch));
            if (isBlocked) card.style.display = "none";
        });
    }

    function runFocusMode() {
        chrome.storage.local.get(["focusMode", "customKeywords", "blockedChannels"], (data) => {
            if (data.focusMode === false) return;

            const regexes = getAllKeywordRegexes(data.customKeywords || []);

            hideDistractions();
            filterRelatedVideos(regexes);
            filterHomePageVideos(regexes);
            filterSearchResults(regexes);
            filterShortsResults(regexes);
            filterByChannel(data.blockedChannels || []);
        });
    }

    // ---- CLICK-BLOCKER (second layer) ----
    // Even if a card slips through the hide-filter (YouTube DOM changed,
    // shorts shelf inside a video page, race condition with the
    // MutationObserver, etc.), this stops the click from opening the
    // video at all if its title matches a blocked keyword.

    function showBlockedOverlay(title, onContinue) {
        // Avoid stacking multiple overlays if user clicks fast multiple times
        const existing = document.getElementById("focus-block-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "focus-block-overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.75);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const box = document.createElement("div");
        box.style.cssText = `
            background: #1a1a2e;
            color: #e6edf3;
            padding: 28px 32px;
            border-radius: 14px;
            max-width: 360px;
            text-align: center;
            font-family: Arial, sans-serif;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        `;

        const heading = document.createElement("div");
        heading.innerText = "This looks like a distraction";
        heading.style.cssText = "font-size: 16px; font-weight: bold; margin-bottom: 8px;";

        const sub = document.createElement("div");
        sub.innerText = `"${title}" matches your focus block list.`;
        sub.style.cssText = "font-size: 13px; opacity: 0.8; margin-bottom: 20px; word-break: break-word;";

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display: flex; gap: 10px; justify-content: center;";

        const stayBtn = document.createElement("button");
        stayBtn.innerText = "Stay Focused";
        stayBtn.style.cssText = `
            background: #3fb950; color: white; border: none;
            padding: 10px 18px; border-radius: 8px; cursor: pointer;
            font-size: 13px; font-weight: bold;
        `;
        stayBtn.addEventListener("click", () => overlay.remove());

        const continueBtn = document.createElement("button");
        continueBtn.innerText = "Watch Anyway";
        continueBtn.style.cssText = `
            background: #333; color: #ccc; border: none;
            padding: 10px 18px; border-radius: 8px; cursor: pointer;
            font-size: 13px;
        `;
        continueBtn.addEventListener("click", () => {
            overlay.remove();
            onContinue();
        });

        btnRow.appendChild(stayBtn);
        btnRow.appendChild(continueBtn);
        box.appendChild(heading);
        box.appendChild(sub);
        box.appendChild(btnRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    function getClickedVideoInfo(target) {
        // Find the nearest link to a video/short, whatever card type it's in
        const link = target.closest("a#thumbnail, a#video-title-link, a[href*='/watch'], a[href*='/shorts/']");
        if (!link) return null;

        // Walk up to the card container to read its title text
        const card = link.closest(
            "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model"
        );
        if (!card) return null;

        const titleEl = card.querySelector("#video-title") || card.querySelector("h3") || card.querySelector("[class*='title']");
        const displayTitle = titleEl ? titleEl.innerText.trim() : (card.innerText || "").trim();

        // Match against the FULL card text (title + channel + description),
        // same as the hide-filters, so clicking is consistent with hiding.
        const fullText = (card.innerText || displayTitle || "").toLowerCase();

        return { link, title: fullText, displayTitle };
    }

    function setupClickBlocker() {
        document.addEventListener(
            "click",
            (event) => {
                chrome.storage.local.get(["focusMode", "customKeywords"], (data) => {
                    if (data.focusMode === false) return;

                    const info = getClickedVideoInfo(event.target);
                    if (!info) return;

                    const regexes = getAllKeywordRegexes(data.customKeywords || []);
                    if (!isDistractionTitle(info.title, regexes)) return;

                    // Block navigation and show the warning instead
                    event.preventDefault();
                    event.stopPropagation();

                    showBlockedOverlay(info.displayTitle, () => {
                        // user chose "Watch Anyway" — follow the link manually
                        window.location.href = info.link.href;
                    });
                });
            },
            true // capture phase — runs before YouTube's own click handlers
        );
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "TIMER_DONE") {
            showTimerAlert();
        }
    });


    // Debounce so MutationObserver firing rapidly (YouTube mutates the
    // DOM a LOT) doesn't run runFocusMode hundreds of times per second.
    let debounceTimer = null;
    function scheduleRunFocusMode() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runFocusMode, 150);
    }

    const observer = new MutationObserver(() => {
        scheduleRunFocusMode();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    runFocusMode();
    setupClickBlocker();


    setInterval(hideDistractions, 1000);
}

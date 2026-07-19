<div align="center">

# 🎯 YouTube Focus Mode

### A Chrome Extension that helps students study on YouTube — without falling into distractions.

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> Built for students who open YouTube to study but end up watching songs, movies, and Shorts for 3 hours.
> This extension blocks all of that — automatically.

<br/>

![Preview Screenshot](Screenshot%202026-05-24%20222409.png)

</div>

---

## 💡 Why I Built This

When I studied on YouTube, I kept getting distracted by recommendations — songs, cricket highlights, movies. I wanted a tool that:
- **Automatically hides** distracting videos (not just a blocker site)
- **Tracks study time** like a real productivity tool
- **Shows my weekly progress** so I stay motivated
- Works **without any backend** — just a Chrome extension

So I built one from scratch.

---

## ✨ Features

### 🔒 Smart Distraction Blocking

| Feature | What It Does |
|---|---|
| **Keyword Blocking** | 30+ built-in keywords (songs, movies, gaming, OTT) + add your own custom keywords |
| **Channel Blocking** | Block entire YouTube channels by name — T-Series, BB Ki Vines, etc. |
| **Element Hiding** | Hides comments section, recommended sidebar, subscribe button, like button, Shorts shelf |
| **Click Blocker** | Second-layer overlay — if a video slips through, clicking it shows a "Stay Focused / Watch Anyway" warning instead of opening it |

### ⏱️ Pomodoro Timer

- **25-minute study sessions** powered by a Chrome Service Worker
- **Keeps ticking** even when the popup is closed or you switch tabs
- **Desktop notification** pops up when session ends
- **Blue banner** appears directly on the YouTube page
- Start / Stop / Reset controls

### 📊 Study Analytics Dashboard

- **Weekly Bar Chart** — Last 7 days of study time, built with pure CSS (no libraries)
- **Streak Counter** — 🔥 Shows how many consecutive days you studied
- **Session Stats** — Sessions completed, total minutes, focus score
- **Subject Tagging** — Pick your subject before each session (Maths, Physics, DSA, Chemistry, etc.) and see colored progress bars for each subject

### 🎨 UI & UX

- **Dark Mode** toggle with persistent preference saved across sessions
- **Green / Red status dot** — see Focus ON or OFF at a glance
- **Chip-style keyword list** — tags with ✕ delete buttons, not ugly bullet lists

---

## 🛠️ Tech Stack

| Technology | How I Used It |
|---|---|
| **JavaScript ES6+** | All extension logic — no frameworks |
| **Chrome Manifest V3** | Extension config, service worker registration, permissions |
| **Chrome Service Worker** | Runs the Pomodoro timer independently in the background |
| **Chrome Storage API** | Shared "notebook" — all 5 files communicate through this |
| **Chrome Notifications API** | Desktop alert when Pomodoro session ends |
| **Chrome Tabs API** | Sends timer-done message to all open YouTube tabs |
| **MutationObserver** | Watches YouTube's dynamic DOM and re-applies filters when new content loads |
| **Regex** | Keyword matching with word-boundary + squished-word support for hashtags |
| **CSS Flexbox** | Full layout + pure CSS bar charts (no Chart.js, no libraries) |
| **Capture Phase Events** | Click interception that fires before YouTube's own handlers |

---

## ⚔️ Challenges I Faced (and How I Solved Them)

These were real problems I hit while building — not textbook examples.

---

### 1. YouTube keeps re-injecting elements I hide

**Problem:** I used `element.style.display = "none"` to hide comments and sidebar. But YouTube is a Single Page App — every time you navigate to a new video, it re-renders the entire DOM. My hidden elements came back.

**Solution:** Two-layer approach:
```js
// Layer 1: MutationObserver watches for new DOM insertions
const observer = new MutationObserver(() => {
    scheduleRunFocusMode(); // re-run filters when YouTube mutates DOM
});
observer.observe(document.body, { childList: true, subtree: true });

// Layer 2: setInterval as a safety net (every 1 second)
setInterval(hideDistractions, 1000);
```

---

### 2. The timer stops when the popup closes

**Problem:** My first timer used `setInterval` inside `popup.js`. The moment the user closed the popup window, the timer died.

**Solution:** Moved the timer to `background.js` which runs as a **Chrome Service Worker** — it lives independently of any UI window.

```js
// background.js — runs even when popup is closed
timerInterval = setInterval(() => {
    timeLeft--;
    chrome.storage.local.set({ timerLeft: timeLeft });
    if (timeLeft <= 0) { /* fire notification */ }
}, 1000);
```

---

### 3. How do popup.js and background.js share data?

**Problem:** `popup.js` and `background.js` are completely separate files with no direct connection. How does background.js know which subject the student selected in the popup?

**Solution:** Used `chrome.storage.local` as a shared "database":
```js
// popup.js saves the subject when Start is clicked
chrome.storage.local.set({ currentSubject: "Physics" });

// background.js reads it when the timer ends
chrome.storage.local.get("currentSubject", (res) => {
    subjectData[res.currentSubject] += 25; // add 25 mins to Physics
});
```

---

### 4. Videos with squished keywords in titles

**Problem:** My regex `\bram charan\b` didn't catch titles like "Ramcharan New Movie" — because there's no space.

**Solution:** For every multi-word keyword, I generate **two** regex patterns:
```js
// "ram charan" → generates BOTH:
/\bram charan\b/i     // normal
/\bramcharan\b/i      // squished — catches hashtags like #ramcharan
```

---

### 5. Click blocker needed to fire before YouTube's own handlers

**Problem:** YouTube has its own click listeners. If I registered my click blocker in the normal **bubble phase**, YouTube's handler fired first and navigated away before mine could block it.

**Solution:** Registered in the **capture phase** — which fires top-down, before any element handler:
```js
document.addEventListener("click", handler, true); // ← true = capture phase
```

---

### 6. YouTube CSS selectors break silently

**Problem:** I used selectors like `ytm-shorts-lockup-view-model` but YouTube updated it to `ytm-shorts-lockup-view-model-v2`. My Shorts filter stopped working silently — no error, just didn't hide anything.

**Solution:** Query both old and new selectors together, and fall back to `h3 / span` if neither matches:
```js
document.querySelectorAll(
    "ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model"
);
```

---

## 📦 Installation (Load Unpacked — Free)

```bash
# Step 1: Clone the repo
git clone https://github.com/ashokvarma1188/youtube-focus-extension.git
```

```
Step 2: Open Chrome → go to chrome://extensions
Step 3: Enable Developer Mode (top-right toggle)
Step 4: Click "Load unpacked" → select the cloned folder
Step 5: Pin the extension → open YouTube → Focus Mode is active!
```

> **No Chrome Web Store needed.** Load it directly for free in seconds.

---

## 🗂️ Project Structure

```
youtube-focus-extension/
│
├── manifest.json       ← Extension config: permissions, service worker, content scripts
├── background.js       ← Service Worker: timer countdown, saves weekly + subject data
├── content.js          ← Injected into YouTube: keyword filter, element hiding, click blocker
├── popup.html          ← Extension popup UI (the window that opens when you click the icon)
├── popup.js            ← Popup logic: toggle, timer display, charts, keyword + channel lists
└── popup.css           ← Styles: dark mode, chip list, bar chart layout, subject bars
```

---

## 🔑 Key Technical Concepts

**`background.js` as Service Worker**
The Pomodoro timer lives here — completely independent of the popup. Chrome keeps it alive in the background even after the popup is closed.

**`chrome.storage.local` as Shared Database**
No backend server. All 5 files communicate through Chrome's built-in key-value storage. `storage.onChanged` lets the popup update charts instantly when background.js saves new data.

**MutationObserver + Debounce**
YouTube is a Single Page App — DOM changes happen constantly. `MutationObserver` watches for new content and re-applies all filters within 150ms, debounced to prevent hundreds of runs per second.

**Regex with Squished-Word Support**
Keywords compile to `RegExp` objects once per run (not per video card). Multi-word keywords generate an extra "squished" variant to catch hashtag spellings like `#ramcharan`.

**Capture Phase Click Blocker**
A `click` listener in the capture phase fires before YouTube's own navigation handlers — letting the extension intercept the click and show a warning overlay instead of opening the video.

**Pure CSS Bar Charts**
Weekly stats and subject progress bars are built entirely with `div` elements and Flexbox — no Chart.js, no Canvas, no external libraries.

---

## 🚀 How to Use

| Action | How |
|---|---|
| Enable / Disable Focus | Click the green/red toggle button |
| Add a keyword to block | Type keyword → click **Add Keyword** |
| Block a YouTube channel | Type channel name → click **Add Channel** |
| Start a study session | Pick subject from dropdown → click **Start** |
| View weekly progress | Scroll down in popup → bar chart + streak badge |
| Switch Dark Mode | Click the **Dark Mode** button |

---

## 👨‍💻 Author

**Ashok Varma Thotakura**

[![GitHub](https://img.shields.io/badge/GitHub-ashokvarma1188-181717?style=for-the-badge&logo=github)](https://github.com/ashokvarma1188)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ashok%20Varma-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/ashok-varma-287a03299/)
[![LeetCode](https://img.shields.io/badge/LeetCode-380+%20Problems-FFA116?style=for-the-badge&logo=leetcode)](https://leetcode.com/u/ashokvarma5247/)

---

## 📄 License

MIT License — use it, fork it, learn from it.

---

<div align="center">

**Built to solve a real student problem — not just for a portfolio.**

If this helped you — give it a ⭐ star!

</div>

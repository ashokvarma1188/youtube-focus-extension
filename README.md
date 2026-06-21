# 🎯 YouTube Focus Mode — Chrome Extension

> A Chrome Extension built for students to stay **focused and distraction-free** while studying on YouTube. Block distracting videos, track study sessions with a Pomodoro timer, and visualize your weekly progress.

![YouTube Focus Mode Preview](Screenshot%202026-05-24%20222409.png)

---

## ✨ Features

### 🔒 Smart Distraction Blocking
| Feature | What it does |
|---|---|
| **Keyword Blocking** | 30+ built-in keywords (songs, movies, gaming) + add your own custom keywords |
| **Channel Blocking** | Block entire channels by name — T-Series, BB Ki Vines, etc. |
| **Element Hiding** | Hides comments, recommended sidebar, subscribe button, like button, Shorts shelf |
| **Click Blocker** | Second-layer overlay catches any video that slips through — shows "Stay Focused / Watch Anyway" |

### ⏱️ Pomodoro Timer
- 25-minute focus sessions powered by a **Chrome Service Worker** — keeps ticking even when popup is closed
- **Desktop notification** + blue banner on YouTube page when session ends
- Start / Stop / Reset controls

### 📊 Study Analytics Dashboard
- **Weekly Study Chart** — Bar chart of last 7 days study time built with pure CSS
- **Streak Counter** — Tracks how many consecutive days you studied (🔥 3 days in a row!)
- **Session Stats** — Sessions completed, total minutes, focus score
- **Subject Tagging** — Pick a subject before each session (Maths, Physics, DSA, Chemistry, etc.) and see per-subject progress bars

### 🎨 UI
- Dark Mode toggle with persistent preference
- Green / Red status dot — Focus ON or OFF at a glance

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **JavaScript (ES6+)** | Core extension logic |
| **Chrome Manifest V3** | Extension configuration and permissions |
| **Chrome Service Worker** | Background Pomodoro timer |
| **Chrome Storage API** | Persistent data — no backend needed |
| **Chrome Notifications API** | Desktop alert on timer end |
| **Chrome Tabs API** | Sends timer-done message to YouTube tabs |
| **MutationObserver** | Re-filters videos as YouTube loads new content dynamically |
| **Regex** | Keyword matching with word-boundary and squished-word support |
| **CSS Flexbox** | Layout and pure CSS bar charts |

---

## 📦 Installation

**Step 1** — Clone this repository
```bash
git clone https://github.com/ashokvarma1188/youtube-focus-extension.git
```

**Step 2** — Open Chrome and navigate to:
```
chrome://extensions
```

**Step 3** — Enable **Developer Mode** (toggle in top-right corner)

**Step 4** — Click **Load unpacked** → select the cloned project folder

**Step 5** — Pin the extension to your Chrome toolbar and open YouTube!

---

## 🚀 How to Use

| Action | Steps |
|---|---|
| Enable / Disable Focus | Click the green/red toggle button in the popup |
| Block a keyword | Type keyword → click **Add Keyword** |
| Block a channel | Type channel name → click **Add Channel** |
| Start a study session | Pick your subject → click **Start** |
| View weekly progress | Scroll down in popup to see the bar chart |
| Toggle Dark Mode | Click the **Dark Mode** button |

---

## 📁 Project Structure

```
youtube-focus-extension/
├── manifest.json      # Extension config — permissions, service worker, content scripts
├── background.js      # Service worker — timer countdown, saves weekly & subject data
├── content.js         # Injected on YouTube — filters videos, hides elements, click blocker
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic — toggle, timer, charts, keyword & channel lists
├── popup.css          # Styles including dark mode and bar chart layout
└── youtube-play.png   # Extension icon
```

---

## 🔑 Key Technical Concepts

**Chrome Manifest V3 Service Worker**
The Pomodoro timer runs in `background.js` as a service worker — it keeps counting down even when the popup is closed or the user navigates away from YouTube.

**MutationObserver with Debounce**
YouTube is a Single Page Application — it constantly mutates the DOM when navigating between pages. A `MutationObserver` watches for these changes and re-applies all filters within 150ms, debounced to prevent running hundreds of times per second.

**Regex Keyword Matching**
Keywords are compiled into `RegExp` objects once per run (not per card). Multi-word keywords like `"ram charan"` also generate a squished variant `"ramcharan"` to match hashtags and merged spellings in video titles.

**Capture Phase Click Blocker**
A `click` event listener registered in the **capture phase** fires before YouTube's own handlers — allowing the extension to block navigation to any matched video and show a warning overlay instead.

**Chrome Storage as a Shared Database**
All files communicate through `chrome.storage.local` — no backend required. The service worker writes session and subject data; the popup reads it and updates charts live via `storage.onChanged`.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/NewFeature`
3. Commit your changes: `git commit -m 'Add NewFeature'`
4. Push to the branch: `git push origin feature/NewFeature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Ashok Varma Thotakura**

[![GitHub](https://img.shields.io/badge/GitHub-ashokvarma1188-181717?style=flat&logo=github)](https://github.com/ashokvarma1188)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ashok%20Varma-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/ashok-varma-287a03299/)
[![LeetCode](https://img.shields.io/badge/LeetCode-ashokvarma5247-FFA116?style=flat&logo=leetcode)](https://leetcode.com/u/ashokvarma5247/)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>If this extension helped you stay focused — give it a ⭐ star!</b>
</div>

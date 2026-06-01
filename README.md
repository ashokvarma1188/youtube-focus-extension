# 🎯 YouTube Focus Mode — Chrome Extension

A Chrome Extension built for students to stay **focused and distraction-free** while studying on YouTube

---

## 📸 Preview

![YouTube Focus Mode Preview](Screenshot%202026-05-24%20222409.png)

---

## 🚀 Features

- **Focus Mode Toggle** — Hide comments, recommendations, subscribe button and Shorts with one click
- **Smart Video Filter** — Automatically hides songs, movies and entertainment videos from recommendations
- **Pomodoro Timer** — Built-in 25-minute study timer that runs even when popup is closed
- **Break Reminder** — Shows a banner on YouTube page when study session is complete
- **Browser Notification** — Get notified when timer finishes even if you switch tabs
- **Dark Mode** — Clean dark theme for late night study sessions
- **Session Stats** — Track how many sessions you completed and total focus time
- **Status Indicator** — Green/Red dot shows if Focus Mode is ON or OFF

---

## 🛠️ Tech Stack

- JavaScript
- HTML5
- CSS3
- Chrome Extensions API (Manifest V3)
- Chrome Storage API
- Chrome Notifications API
- Chrome Tabs API

---

## 📦 Installation

Since this extension is not on Chrome Web Store yet, you can install it manually:

**Step 1** — Clone or Download this repository
```
git clone https://github.com/ashokvarma1188/youtube-focus-extension.git
```

**Step 2** — Open Google Chrome and go to:
```
chrome://extensions
```

**Step 3** — Enable **Developer Mode** (top right toggle)

**Step 4** — Click **Load unpacked**

**Step 5** — Select the downloaded `youtube-focus-extension` folder

**Step 6** — Pin the extension to your toolbar and start focusing! 🎯

---

## 📁 Project Structure

```
youtube-focus-extension/
│
├── manifest.json      # Extension configuration
├── content.js         # Runs on YouTube — hides distractions & filters videos
├── background.js      # Service worker — handles timer & notifications
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic — focus toggle, dark mode, timer controls
└── icon.png           # Extension icon
```

---

## 🎯 How It Works

### Focus Mode
When Focus Mode is ON, the extension hides:
- YouTube comments section
- Recommended videos sidebar
- Subscribe button
- Notification bell
- YouTube Shorts shelf

### Smart Video Filter
When Focus Mode is ON, the extension scans all video titles on:
- YouTube home page
- Right side recommendations

Any video containing entertainment keywords (songs, movies, cricket, gaming etc.) is automatically hidden — keeping only educational content visible!

### Pomodoro Timer
- Start a 25-minute focus session
- Timer runs in the background even when popup is closed
- When time is up — a blue banner appears on the YouTube page
- Session count and total focus time are saved automatically

---

## 🤝 Contributing

This is an open source project — contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 💡 Upcoming Features

- [ ] Break timer after each Pomodoro session
- [ ] Custom keyword list — add your own block keywords
- [ ] Daily focus goal setting
- [ ] Focus streak counter
- [ ] Keyboard shortcut to toggle focus mode

---

## 👨‍💻 Author

**Ashok Varma Thotakura**

- GitHub: [@ashokvarma1188](https://github.com/ashokvarma1188)
- LinkedIn: [Ashok Varma](https://www.linkedin.com/in/ashok-varma-287a03299/)
- LeetCode: [@ashokvarma5247](https://leetcode.com/u/ashokvarma5247/)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>If this extension helped you stay focused — give it a ⭐ star!</b>
</div>

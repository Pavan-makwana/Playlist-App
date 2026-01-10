# 🎧 PA1's AUDIO PLAYER — YouTube Playlist Quest

**PA1's AUDIO PLAYER** is an open-source, web-based music player that transforms YouTube playlists into a **gamified audio-only listening experience**.

Instead of unlimited access, users unlock songs gradually by earning **Essence (XP)** — making music listening more intentional, immersive, and distraction-free.

---

## 🚀 Concept

> **Listen → Earn → Unlock**

1. Paste your **YouTube playlist link**
2. Start with **only 3 unlocked songs**
3. Earn **Essence (XP)** while listening
4. Every **20 Essence unlocks 1 new song**
5. Supports **background listening**
6. Progress is saved locally

---

## 🧠 Why PA1's AUDIO PLAYER?

Most music platforms encourage:
- Infinite scrolling
- Constant skipping
- Visual overload

**PA1's AUDIO PLAYER changes this** by:
- Removing video distractions
- Encouraging full-song listening
- Gamifying progress
- Rewarding patience over skipping

---

## 🕹️ Key Features

### 🎵 Audio-Only YouTube Playback
- Powered by **YouTube IFrame Player API**
- Video hidden for minimal distraction
- Clean and smooth listening experience

### 🎮 Gamified Unlock System
- Only 3 songs unlocked initially
- Unlock new songs using Essence (XP)

### ⚡ Essence (XP) System
Earn Essence by:
- Completing a song ✅
- Clicking anywhere on the app screen 👾 *(intentional dev cheat)*

### 💾 Persistent Progress
- XP and unlocked tracks stored using `localStorage`
- Continue exactly where you left off

### 🌌 Minimal Cyberpunk UI
- HUD-style interface
- Clean, immersive design
- Built for focus

---

## 🛠️ Tech Stack

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS
- 📺 YouTube IFrame Player API
- 📡 YouTube Data API v3

---

## 📦 Installation & Setup

### 🔧 Prerequisites
- Node.js v18+
- YouTube Data API v3 Key  

---

### 🧰 Steps

1. **Clone the repository**
```bash
git clone https://github.com/Pavan-makwana/Playlist-App.git
cd Playlist-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Create a `.env` file**
```env
VITE_YT_API_KEY=your_youtube_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

---

## 🌍 Roadmap

- ⏱️ Time-based Essence rewards
- 🏆 Levels & achievements
- 🔐 User authentication
- 📱 PWA support
- 🎧 Spotify playlist integration

---

## 🤝 Contributing

Contributions are welcome!
- Open an issue
- Submit a pull request
- Suggest new ideas

---

## ⭐ Support

If you like the project:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Share feedback

---

## 📜 License

This project is licensed under the **MIT License**.

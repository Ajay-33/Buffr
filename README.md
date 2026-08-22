# 🕹️ Buffr — Gamified Habit Tracker & Arcade HUD

> **“Build your character by building your habits.”**  
> A retro arcade-themed personal character progression system that turns daily discipline into XP, combo streaks, attribute levels, and boss quest victories.

---

## 🌟 Features

### 🎮 Retro Arcade HUD & Aesthetic
- **Pixel & CRT Arcade Styling**: High-contrast cyberpunk palette (`#090416` background, neon yellow `#facc15`, cyan `#06b6d4`, hot pink `#ec4899`, and emerald `#22c55e`).
- **Procedural 8-Bit Chiptune Engine**: Pure Web Audio API procedural sound synthesizer for quest completions, power-ups, level ups, combos, and streak freeze protections.
- **Haptic & Visual Feedback**: Confetti explosions, animated XP popups, and scanline overlay.

### ⚔️ Core Habit & Quest Engine
- **Daily Quests & Checklists**: Filter by time of day (*Morning*, *Afternoon*, *Evening*, *Anytime*) or life pillar.
- **Numeric & Counter Tracking**: Support for boolean checkboxes, numeric counters (e.g. 2500ml water, 50 pushups, 25 pages), and step milestones.
- **Dynamic Combo Streaks**: Consecutive day multipliers with up to +30% bonus XP per completed habit.
- **Streak Freeze Shields**: Protect your hard-earned combos during travel, rest, or illness without losing momentum.
- **Habit Pause & Archival**: Temporary pause modes with reason logs so vacations don't ruin streak records.

### 📊 Character Attributes & Matrix Analytics
- **Spider / Radar Attribute Tree**: Real-time attribute calculation across 8 core life disciplines:
  - 🏋️ **Fitness** (Strength & Conditioning)
  - 💧 **Health** (Hydration & Vitality)
  - 🧠 **Mind** (Wisdom & Knowledge)
  - ⚡ **Focus** (Cognitive Output)
  - 🛡️ **Discipline** (Willpower & Routine)
  - 🕯️ **Mindfulness** (Inner Peace & Stoicism)
  - 🌙 **Sleep** (Recovery & Rest)
  - 💰 **Finance** (Resource Management)
- **Consistency Heatmap Matrix**: 7-day, 30-day, and multi-month GitHub-style habit completion matrices.
- **Daily Reflection & Debrief**: End-of-day energy/mood check, daily win logs, and tactical upgrades.
- **Stage Clear Weekly Review**: Automated 7-day review summarizing consistency rates, perfect days, top pillars, and coach takeaways.

### 📱 Mobile PWA & Glance Widgets
- **Standalone PWA Ready**: Installable to Android & iOS home screens with standalone fullscreen display and custom icon.
- **Android Glance HUD Simulator**: Live interactive preview of 2x2 compact and 4x2 quick-dispatch homescreen widgets.
- **Instant Client-Side Persistence**: Offline-first storage with 0ms latency and full JSON backup export/import.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS Scanlines & Pixel Grid |
| **Typography** | `Press Start 2P`, `VT323`, `Pixelify Sans`, `Chakra Petch` |
| **Sound FX** | Web Audio API (Procedural 8-Bit Chiptune Synthesizer) |
| **Animations** | Motion (`motion/react`), Canvas Confetti |
| **Icons** | Lucide React |
| **Tooling** | Vite 6, TSX, ESLint |
| **Deployment** | Google Cloud Run / Vercel / Netlify |

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/buffr.git
cd buffr
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
The compiled static assets will be in the `dist/` directory.

---

## 📱 Mobile Installation (PWA)

1. Open the deployed application URL on your mobile browser (Safari on iOS or Chrome on Android).
2. **Android**: Tap the browser menu `⋮` ➔ **Add to Home screen** / **Install app**.
3. **iOS (iPhone/iPad)**: Tap the Share button `⎋` ➔ **Add to Home Screen**.
4. Launch Buffr directly from your home screen in distraction-free fullscreen mode.

---

## 💾 Data Backup & Restore

- Go to **Profile** (top right avatar badge) ➔ **Backup & Security**.
- Click **Export JSON Backup** to save your entire quest history, streak counts, reflections, and stats to a single `.json` file.
- Click **Import JSON** on any new device to restore your character sheet instantly.

---

## 📄 License
MIT License. Free to use, customize, and level up!

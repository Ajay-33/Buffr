# 🕹️ Buffr — Gamified Habit Tracker & Arcade HUD

> **“Build your character by building your habits.”**  
> A retro arcade-themed personal character progression system that turns daily discipline into XP, combo streaks, attribute levels, and boss quest victories. Powered by an offline-first architecture with real-time Firebase Cloud synchronization and Google Authentication.

---

## 🌟 Features

### 🎮 Retro Arcade HUD & Aesthetic
- **Pixel & CRT Arcade Styling**: High-contrast cyberpunk palette (`#090416` background, neon yellow `#facc15`, cyan `#06b6d4`, hot pink `#ec4899`, and emerald `#22c55e`).
- **Procedural 8-Bit Chiptune Engine**: Pure Web Audio API procedural sound synthesizer for quest completions, power-ups, level ups, combos, and streak freeze protections.
- **Haptic & Visual Feedback**: Confetti explosions, animated XP popups, and CRT scanline overlays.

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

### 🔥 Cloud Sync & Google Authentication
- **Firebase Firestore Integration**: Real-time cloud database syncing habits, completions, XP transactions, reflections, and player level progression.
- **Google Sign-In**: One-click Google Authentication with user-isolated subcollections (`/users/{userId}/*`).
- **Offline-First Zero-Latency Engine**: Instant UI response via local storage with automatic background synchronization when online.
- **Dedicated Distinct HUD Controls**: High-clarity arcade indicators for Cloud Sync (`G-SYNC`), active combo counters, and lives remaining.

### 📱 Responsive Mobile Experience & PWA Shortcuts
- **Adaptive Mobile Layout**: Automatically switches to an edge-to-edge, touch-optimized fullscreen view on mobile devices (`≤ 768px`) and offers an optional device frame toggle on desktop.
- **Standalone PWA Ready**: Installable to Android & iOS home screens with standalone fullscreen display, offline caching, and custom app icons.

### 🤖 Native Android Application & Home Screen Widgets
- **Native Android Home Screen Widgets**:
  - 📱 **Buffr Quest HUD (4x2 / 4x1)**: Glanceable daily quest counter, progress bars, real-time XP tracker, current level badge, combo streak flames, gold balance, and 1-tap quick launch action button into today's quests.
  - 🔥 **Buffr Mini Streak Widget (2x2 / 2x1)**: Ultra-compact square widget highlighting active combo streak, hero level, and remaining daily habits count.
  - 🔄 **Real-Time Dynamic Sync Bridge**: Automatically broadcasts habit completions, XP level-ups, and profile changes to the native Android widget manager via zero-lag local bridge.
- **Native Firebase Auth**: Uses the `@capacitor-firebase/authentication` plugin for a seamless native Google Sign-In experience (bypasses WebView popup restrictions).
- **High-Fidelity Branding**: Custom adaptive Android icons generated from the source SVG, ensuring the brand stays "intact" on all devices with matching theme colors.
- **Optimized Performance**: Production-ready Proguard configurations and modernized Gradle build scripts.
- **Android Long-Press Quick Launchers**: 1-tap launcher shortcuts on supported home screens to jump straight into **Today's Quests** or **Daily Debrief**.

### 🎁 Dynamic Loot Drops & Rarities
- **Procedural Loot Engine**: Completing habits dynamically rolls for rare gear drops based on difficulty, streaks, and perfect days (high-variance, unpredictable loot pool).
- **6-Tier Rarity Scale**: *Common* (Grey), *Uncommon* (Emerald), *Rare* (Cyan), *Epic* (Purple), *Legendary* (Gold), and *Mythic* (Hot Pink / Crimson).
- **Equippable Inventory Slots**: Weapons, Armor, Relics, and Consumables that bestow real passive gameplay modifiers (e.g. `+15% XP`, `+5% Crit XP Chance`, `+12% Shield Recovery Rate`).
- **Interactive Loot Discovery Modal**: Full pixel art item unboxing animation with sound effects and instant equip/store options.

### 🌳 4-Branch Interactive Skill Trees
- **Deep Progression Paths**: Spend Skill Points earned from leveling up to unlock permanent passive buffs:
  - 🛡️ **Iron Will (Discipline)**: Boosts streak shields, streak XP multipliers, and anti-lapse resistance.
  - ⚡ **Kinetic Overclock (Fitness & Energy)**: Provides critical hit XP chance, recovery boosts, and physical stamina bonuses.
  - 🧠 **Neuro-Synapse (Focus & Wisdom)**: Unlocks morning dawn XP boosts, deep work multipliers, and tactical insights.
  - ⏳ **Chrono-Mastery (Consistency & Momentum)**: Grants weekend momentum protection, retrospective backfill grace, and evening wind-down bonuses.

### 🎒 Pixel Art Armory & Vault
- **Active Loadout HUD**: Equip collected weapons, shields, boots, and legendary artifacts to augment your pilot stats.
- **Vault Filtering & Sorting**: Filter items by rarity (*All*, *Common*, *Rare*, *Epic*, *Legendary*, *Mythic*) or gear type (*Weapon*, *Armor*, *Relic*, *Consumable*).

### 🕹️ 16-Bit Retro Cartridge Shareable Wrap
- **Shareable Vintage Cartridge**: Generate an authentic 90s-style Game Boy / SNES physical cartridge summary card featuring your pilot callsign, tier, completion count, longest streak, and top guild.
- **High-Res Canvas PNG Download**: 1-click download of your personalized retro cartridge to share on Twitter/X, Discord, or Instagram stories.

---

## 🛠️ Android Development Workflow

Buffr uses **Capacitor** to bridge the React web application with the native Android environment.

### How it Works (The Bridge)
1.  **Web Layer**: Your UI and logic live in React (`src/`).
2.  **The Sync**: `npx cap sync` copies your compiled web code into the Android project's `assets` folder.
3.  **The Native Shell**: A Java-based Android Activity (`MainActivity.java`) loads a local WebView that renders your React app.
4.  **The Plugins**: Features like Google Sign-In use native bridges to communicate between JavaScript and the Android OS.

### Build & Deploy Steps
If you make changes to the UI or add AI features in an external editor:

1.  **Update Local Code**:
    ```bash
    git pull origin main
    ```
2.  **Build Web Assets**:
    ```bash
    npm run build
    ```
3.  **Sync with Android**:
    ```bash
    npx cap sync android
    ```
4.  **Generate APK**:
    - Open the `android` folder in **Android Studio** and click **Run**.
    - OR run via terminal:
      ```bash
      cd android && ./gradlew assembleDebug
      ```

### Finding the Output APK
After a successful build, your installable file is located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS Scanlines & Pixel Grid |
| **Database & Auth** | Firebase Firestore, Firebase Authentication (Google Auth) |
| **Typography** | `Press Start 2P`, `VT323`, `Pixelify Sans`, `Chakra Petch` |
| **Sound FX** | Web Audio API (Procedural 8-Bit Chiptune Synthesizer) |
| **Animations** | Motion (`motion/react`), Canvas Confetti |
| **Icons** | Lucide React |
| **Tooling & Build** | Vite 6, TSX, ESLint |

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

## 💾 Cloud Sync & Data Backup

- **Google Cloud Save**: Tap `G-SYNC` in the top header or navigate to **Profile ➔ Cloud Sync** to sign in with your Google account. All habits, streaks, and debriefs sync automatically across all devices.
- **Memory Card (JSON)**: Go to **Profile** ➔ **Memory Card Save & Backup** to export or import your raw JSON save state at any time.
- **Start Fresh / Wipe Data (Level 1 Restart)**: Under **Profile ➔ Memory Card Save & Backup**, click **START FRESH (RESET LEVEL 1)** to erase all trial habits, logs, XP, and streaks, reopening the initial setup wizard to start your serious journey from Day 1.
- **Reload Demo Save**: Use **RELOAD 30-DAY DEMO SAVE** whenever you want to test features with sample history.

---

## 📄 License
MIT License. Free to use, customize, and level up!

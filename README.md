# 🎮 NextQuest – Game Backlog Tracker

A sleek, modern web app for tracking your video‑game backlog. You can **add**, **edit**, **delete**, and move games through the statuses *backlog → playing → completed*. It also includes:
- **Mood Picker** – suggest a game based on a vibe.
- **Spin the Wheel** – a randomizer that selects any game (including completed) and shows the result in a modal.
- **Stats Dashboard** and a clean dark‑theme UI.

## 🚀 Quick start on a brand‑new machine

1. **Clone the repo** (or copy the folder) to your workstation.
2. **Install Node.js** (v22 or newer). You can download it from https://nodejs.org/.
3. Open a terminal in the project root (`./Game_Tracker`).
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```
   This will start the Express server on `http://localhost:3000` and automatically watch for changes.
6. Open your browser and navigate to `http://localhost:3000` – the app is ready to use.

> **Note**: The app uses SQLite via the built‑in `node:sqlite` module, so no extra database setup is required. The `backlog.db` file will be created automatically on first launch.

## 🛠️ Tech stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (no framework).
- **Backend**: Node.js + Express.
- **Database**: SQLite (via `node:sqlite`).
- **Dev tools**: Nodemon for hot‑reloading.

## 📂 Project structure (high‑level)
```
public/
  ├─ css/style.css   # all UI styling, including glass‑morphism and wheel styles
  ├─ js/home.js      # main app logic (CRUD, mood picker)
  ├─ js/wheel.js     # wheel spin implementation
  └─ index.html, mood.html, wheel.html
server/
  ├─ routes/games.js   # CRUD API
  ├─ routes/mood.js    # mood‑based suggestion (prioritizes backlog)
  └─ routes/wheel.js   # (optional) API for wheel data
 db/
  └─ database.js  # SQLite connection
```

## 🎨 Design notes
- Dark theme with customizable CSS variables.
- Glass‑morphism cards, subtle micro‑animations, and icon tooltips.
- Favicon: a simple game‑controller SVG (`favicon.svg`).

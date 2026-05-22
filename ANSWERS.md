# Answers.md

## How to run
1. Clone or copy the project folder `./NextQuest`.
2. Open a terminal in that folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   The app will be reachable at `http://localhost:3000`.

## Stack choice
- **Frontend**: Plain HTML, vanilla CSS, and JavaScript – gives full visual control and a lightweight bundle while meeting the premium UI requirements.
- **Backend**: Node.js + Express – simple static‑file serving and JSON APIs without extra scaffolding.
- **Database**: SQLite via the built‑in `node:sqlite` module – zero‑install, cross‑platform, and avoids native‑compile pain of `better‑sqlite3`.

A worse choice would have been a heavy SPA framework (React/Vue) or a native compiled DB driver, as they add unnecessary complexity, larger bundle size, and extra build steps for this minimal tracker.

## One real edge case
- **Missing optional fields on game update** – In `server/routes/games.js` line **71**, the UPDATE statement now coerces optional fields (`platform`, `genre`, `mood_tags`, `rating`, `notes`) to `null` when they are undefined. Without this, SQLite throws an error and the API responds with *Failed to update game* when a user edits a game without touching those fields.

## AI usage

I used Antigravity AI (powered by Google Deepmind) as my pair-programming assistant throughout development.
I used an AI agent to scaffold the entire project from a detailed markdown specification. The AI generated the backend Express routes, configured the built-in `node:sqlite` connection, and generated the CSS design system according to the specific color codes and design language constraints (e.g. glassmorphism, flexbox) I provided in the requirements.


| Tool | Prompt | AI Output | Modification |
|------|--------|-----------|--------------|
| `multi_replace_file_content` | Add `.icon-btn` class to center edit/delete icons | Inserted generic CSS | Refined selector, added hover opacity and margin for layout consistency |
| `replace_file_content` | Fix game‑update endpoint handling undefined values | Simple replace of `stmt.run` line | Expanded to explicitly coerce each optional field to `null` for SQLite safety |
| `write_to_file` | Create `public/wheel.html` and `public/js/wheel.js` (spin wheel) | Boilerplate HTML/JS | Adjusted result rendering to use a `<dialog>` modal, ensured modal shows after spin |
| `generate_image` | Create a simple game‑controller favicon | SVG markup | Saved as `favicon.svg` and linked in HTML |



## Honest gap
The UI works great on desktop, but **mobile responsiveness is limited** – the wheel canvas and modal don’t scale fluidly and some button groups overflow on small screens. With an extra day I would:
1. Add media queries to shrink the wheel canvas gracefully.
2. Convert the modal to a full‑screen overlay on narrow viewports.
3. Implement touch‑based spin interaction (swipe‑to‑spin) for a better mobile experience.

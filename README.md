# Spellcaster

A Discord.js v14 bot template with dynamic slash-command loading and optional Google Sheets support.

## Setup

```bash
npm install
npm run deploy
npm start
```

For fast local command updates in one server:

```bash
npm run deploy:dev
npm run dev
```

Docker:

```bash
docker compose up --build
```

## Environment

Copy `.env.example` to `.env` and fill in:

```env
BOT_TOKEN=
CLIENT_ID=
GUILD_ID=
SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

`BOT_TOKEN` and `CLIENT_ID` come from the Discord Developer Portal. `GUILD_ID` is the server ID used by `npm run deploy:dev`. The Google Sheets values are only needed by commands that use `utils/sheets.js`.

## Commands

Commands live in `commands/<folder>/<file>.js`. Each command exports a `SlashCommandBuilder` as `data` and an `execute(interaction)` function.

After adding, renaming, or removing a slash command, run:

```bash
node deploy-commands.js
```

The template includes `/ping` as a smoke test.

For development, run `npm run deploy:dev` to register commands to the server named by `GUILD_ID`. Guild commands update much faster than global commands.

### Investigation Stories

Add each `/investigate` story as a JSON file in `data/stories/`. The files already in that directory show complete story examples. The filename without `.json` is the internal story key and must use up to 20 letters, numbers, underscores, or hyphens. Node IDs use the same characters, up to 20 characters.

Each story has a display `name`, a starting node ID in `start`, and a `nodes` object. Each node has `text` and either a `choices` array or `"ending": true`. A choice has a button `label` and exactly one of `next` or `response`: `next` names one destination node or an array of possible destination nodes, while `response` sends a private message and keeps the player at the current node. For example, `"next": ["gallery", "stairwell", "roof"]` randomly chooses one destination the player has not visited yet. That button is disabled when all destinations in its array have already been visited. Buttons that lead to a previously visited node are disabled, and a `response` choice is disabled after it is selected. Node text and responses can be up to 2000 characters, button labels up to 80 characters, and each node can have up to 25 choices. Stories and their content are loaded locally from these files. Active run progress is held in memory and expires after seven days of inactivity, so restarting the bot resets active runs.

## Google Sheets

`utils/sheets.js` exposes a generic authenticated Sheets client plus small helpers for reading, writing, and appending values. Share your spreadsheet with the service account email before using the bot.

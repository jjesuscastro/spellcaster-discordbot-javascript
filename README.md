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

## Google Sheets

`utils/sheets.js` exposes a generic authenticated Sheets client plus small helpers for reading, writing, and appending values. Share your spreadsheet with the service account email before using the bot.

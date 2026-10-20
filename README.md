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
DATABASE_URL=
```

`BOT_TOKEN` and `CLIENT_ID` come from the Discord Developer Portal. `GUILD_ID` is the server ID used by `npm run deploy:dev`. The Google Sheets values are only needed by commands that use `utils/sheets.js`.

Combat data is stored in PostgreSQL. Set `DATABASE_URL` to the shared Bookkeeper database, then create Spellcaster's separate combat table with:

```bash
npm run db:apply-schema
```

Each row in `spellcaster_combat_characters` represents one character and links it to a Discord account with `discord_id`. Populate the table with each character's current and maximum HP/MP, AC, stats, modifiers, attack/heal values, and skill data. Skills are a JSON array with `slot`, `name`, `type`, `damage`, `crit`, `mpDrain`, `cooldown`, and `turnsActive` fields. The runtime uses PostgreSQL only; the downloaded Sheets HTML is a reference for these fields and their behavior.

Example character row (replace IDs and values with the character's data):

```sql
INSERT INTO spellcaster_combat_characters (
    discord_id, character_name, max_hp, hp, max_mp, mp, armor_class,
    stats, modifiers, base_skill_modifier, skill_modifier,
    attack_base, attack_crit, heal_base, heal_crit, skills
) VALUES (
    'DISCORD_USER_ID', 'Character Name', 40, 40, 30, 30, 12,
    '{"INT": 2, "CHA": 1, "WIS": 0, "WILL": 2, "STR": 1, "DEX": 3}',
    '{"MAG": 3, "MGT": 2, "FIN": 1, "RES": 2, "ESN": 1, "ARC": 1}',
    2, 2, 18, 24, 8, 12,
    '[{"slot":1,"name":"Skill 1","type":"DPS","damage":18,"crit":27,"mpDrain":5,"cooldown":2,"turnsActive":0}]'
);
```

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

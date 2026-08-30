require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Clears slash commands from one guild.
// Useful for removing stale dev commands after changing GUILD_ID.
// Optionally pass a guild id: npm run clear:dev -- 123456789012345678

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const rest = new REST().setToken(requireEnv('BOT_TOKEN'));

(async () => {
    try {
        const clientId = requireEnv('CLIENT_ID');
        const guildId = process.argv[2] || requireEnv('GUILD_ID');

        if (!/^\d{17,20}$/.test(guildId)) {
            throw new Error('Guild id must be a Discord snowflake id.');
        }

        console.log(`Clearing guild commands for guild ${guildId}...`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [] }
        );
        console.log('Successfully cleared guild commands.');
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();

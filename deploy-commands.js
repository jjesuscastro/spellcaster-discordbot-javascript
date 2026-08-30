require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Run this script once whenever you add, remove, or rename a slash command.
// Commands are registered globally and can take up to about an hour to appear.

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(requireEnv('BOT_TOKEN'));

(async () => {
    try {
        console.log(`Registering ${commands.length} global command(s): ${commands.map(command => command.name).join(', ')}`);
        await rest.put(
            Routes.applicationCommands(requireEnv('CLIENT_ID')),
            { body: commands }
        );
        console.log('Successfully registered application commands.');
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();

require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logAutocompleteUsage, logCommandUsage, logInteractionError } = require('./utils/logger');

process.on('unhandledRejection', err => {
    console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', err => {
    console.error('Uncaught exception:', err);
});

// Spellcaster main entry point.
// Loads all commands from /commands subfolders and routes Discord interactions.

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }
}

client.once('clientReady', async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        logAutocompleteUsage(interaction);

        if (command?.autocomplete) {
            try {
                await command.autocomplete(interaction);
            } catch (err) {
                logInteractionError('Autocomplete failed', err, interaction);
            }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        logCommandUsage(interaction);
        await command.execute(interaction);
    } catch (err) {
        logInteractionError('Command failed', err, interaction);

        try {
            const reply = { content: 'An error occurred while executing that command.', ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(reply);
            } else {
                await interaction.reply(reply);
            }
        } catch (replyErr) {
            console.error('Failed to send command error response:', replyErr);
        }
    }
});

client.login('process.env.BOT_TOKEN');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks whether the bot is responding.'),

    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};

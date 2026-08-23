const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks whether the bot is responding.'),

    async execute(interaction) {
        const catUrl = `https://cataas.com/cat?timestamp=${Date.now()}`;
        const embed = new EmbedBuilder()
            .setDescription('Pong!')
            .setImage(catUrl);

        await interaction.reply({ embeds: [embed] });
    },
};

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ping?'),

    async execute(interaction) {
        const catUrl = `https://cataas.com/cat?timestamp=${Date.now()}`;
        const embed = new EmbedBuilder()
            .setDescription('Pong!')
            .setImage(catUrl);

        await interaction.reply({ embeds: [embed] });
    },
};

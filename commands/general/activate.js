const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activate')
        .setDescription('activate your matching cards!'),
        
    async execute(interaction) {
        
        await interaction.deferReply();
        try {
            const choices = [
                'A',
                'B',
                'C',
            ];
            const size = choices.length;

            const final = Math.floor(Math.random() * size) + 1; 

            const embed = new EmbedBuilder()
                .setTitle(`✧ ${choices[final-1]}`)
                .setColor(0xEBBCA2)
                .setDescription(`Complete the task to activate your card!`);

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

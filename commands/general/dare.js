const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dare')
        .setDescription('drink the potion and find out!'),
        
    async execute(interaction) {
        
        await interaction.deferReply();
        try {
            const choices = [
                'Woah... is that... a tail?! And animal ears?!\nYou have been turned into a Kemonomimi. Potion effects stay until you arrive in E.R.A.',
                'Truth Serum! You can now only say the truth for the next 5 rounds.',
                'You physically cannot say a word for the next 3 rounds.\nThe others pick what word!',
                'Your hair color...uh oh...\nYour hair color has been changed (mun pick). Potion effects stay until you arrive in E.R.A.',
                'You\'re....You\'re shrinking!\nYou have been shapeshifted into a gnome. Potion effects stay until you arrive in E.R.A.',
                'AAAAAAAAAAH.\nYou can only scream for the next 3 rounds.',
                'Woah...why is everyone...changing...?\nEveryone else looks the same (face of your choice) for 5 rounds.'
            ];
            const size = choices.length;

            const final = Math.floor(Math.random() * size) + 1; 

            const embed = new EmbedBuilder()
                .setTitle(`✧ DARE...`)
                .setColor(0xEBBCA2)
                .setDescription(`${choices[final-1]}`);

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

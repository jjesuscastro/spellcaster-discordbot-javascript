const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dare')
        .setDescription('drink the potion and find out!'),
        
    async execute(interaction) {
        
        await interaction.deferReply();
        try {
            const choices = [
                'Truth Serum! You can now only say the truth for the next 5 rounds.',
                'You physically cannot say a word for the next 3 rounds.\nYour carriage-mates get to pick the word!',
                'AAAAAAAAAAH.\nYou can only scream for the next 3 rounds.',
                'Why are the potions so heavy?! You can\'t life them?!\nYou can only pick truth for the next 2 rounds.',
                'Nothing happens.....?\nSike. You suddenly get teleported into another carraige (tag a mod)',
                'What was that?\nYou cannot speak for 3 rounds',
                'Pick someone random and instantly change clothes with them! (It\'s magic)',
                'Poke your head out of the carriage halls and scream something at the top of your lungs.\nYour carriage-mates get to pick what you scream.',
                'The cards... are they glued together just for you?!\nYou can only pick dare for 3 rounds.',
                'Imitate someone in the carriage.\nYour carriage-mates must be able to guess who it is.',
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

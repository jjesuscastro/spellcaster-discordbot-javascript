const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('truth')
        .setDescription('do you promise to be honest?'),
        
    async execute(interaction) {
        
        await interaction.deferReply();
        try {
            const choices = [
                '~~kiss~~ smooch marry kill',
                'biggest fear.',
                'tell the person on ur right smth u dont like abt them.',
                'tell everyone ur 1st impression of them.',
                '10000 edels or save ur mom from a fire.',
                'dont ask me to write questions again. (reroll)',
                'Isn\'t it the wonderful age of first loves? Have you had yours yet? If yes, tell your group about it. If not, how do you imagine it?',
                'Where do you think you’ll be in ten years?',
                'When was the last time you cried? Why?',
                'Tell everyone what you think the best thing about you is! Self-love is important!',
                'Reveal something about yourself that you’d never want your family to know?',
                'What house would you like to be assigned to? ☀️🌙⭐ Any reason?',
                'Ever done something illegal? If yes, what?',
                'If you were a mythical creature, what would you be?',
                'One thing you cannot live without.',
                'Something you regret.',
                'Most likely to be your best friend from everyone here.',
                'Your biggest wish',
                'What’s something you’ve always wanted to tell to the person on your left?',
                'If you could swap lives with someone here, who would it be and why?',
                'Describe what a perfect day is to you!',
                'Are you afraid of death?',
                'Would you survive if you were a worm?',
                'What’s your aura? Vibe check?',
                'Did you lie in any of your previous answers?'
            ];
            const size = choices.length;

            const final = Math.floor(Math.random() * size) + 1; 

            const embed = new EmbedBuilder()
                .setTitle(`✧ TRUTH...`)
                .setColor(0xB7B75F)
                .setDescription(`${choices[final-1]}`);

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test3')
        .setDescription('a')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        
        await interaction.deferReply();
        try {
            const choices = [
                'Play rock paper scissors!',
                'Candies appear out of thin air, floating in front of you and your opponent. Eat the most candies in 1 minute to win. The catch? They disappear if you don’t grab them fast enough!',
                'Stare into each other’s eyes. Whoever blinks first loses.',
                '“Betty Botter bought some butter, but she said the butter’s bitter.” Take turns saying tongue twisters until someone fails.',
                'Coin flip! First one to predict the coin toss wrong loses.',
                'Two lit candles appear in front of each of you. Extinguish your opponent’s candle to win.',
                'A winged rabbit appears and starts zipping forward! Catch it before it escapes! The first person to catch it wins.',
                'The floor is Lava! Decide on an object as a pair, don’t let it touch the ground with magic. The person who lets it touch the ground loses.',
                'Five magical objects appear in front of you: a wand, a crystal ball, a book, a ring, and a hat. One of these is fake. Find the fake one through magic. The person who finds it wins!',
                'Quick! The first person to touch something green wins!',
                'Quick! The first person to touch a tree taller than 4,5 meters (~15 ft) wins!',
                'Quick! The first person to find and bring back a dandelion without any of the seeds blowing away wins!',
                'Test your strength. Arm wrestle.',
                'An enchanted feather appears in between the both of you. The first one to grab it and keep a hold of it for 3 seconds wins. Be careful, it’s really slippery!',
                'Both of you stand on one foot while a tiny magical breeze wraps around you and gets stronger. The first person who puts their foot down loses.',
                'Two enchanted books appear in front of the both of you. Balance the book on your heads and race each other – except the book occasionally flaps its pages to throw you off!',
                '',
                '',
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

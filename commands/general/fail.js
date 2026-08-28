const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test4')
        .setDescription('a')
        .addStringOption(opt =>
            opt.setName('suit').setDescription('a').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const suit = interaction.options.getString('suit');
        
        await interaction.deferReply();
        try {
            const heartchoices = [
                `Bless you. You find yourself sneezing every 30 seconds for 1 hour. `,
                `You cannot speak for {{d6}} hours.`,
                `Your voice suddenly sounds incredibly high pitched — like you’ve inhaled helium. It lasts for {{d6}} hours.`,
                `You’ve hit puberty. Your voice keeps cracking for {{d6}} hours.`,
                `Everything you write down is spoken out loud by a magical voice. Lasts for {{d4}} hours.`
            ];
            const clubchoices = [
                `Ice creeps from the card and onto your arm — your arm is useless for {{d3}} hours.`,
                `Wear some layers! You feel unnaturally cold for {{d3}} days.`,
                `Flowers bloom all over your hair. Plucking them off just makes more flowers appear.`,
                `A small dark cloud looms over you and occasionally starts raining at random intervals. Lasts for {{d3}} days.`,
                `Wear mittens! Your hands are unnaturally hot for {{d24}} hours.`
            ];
            const diamondchoices = [
                `Transfer 250 edels to the winner.`,
                `Transfer 100 edels to the winner.`,
                `Your bed mysteriously disappears for {{d3}} days.`,
                `Your books start screaming whenever you open it.`,
                `Your uniform is suddenly one size too small.`
            ];
            const spadechoices = [
                `Are those animal ears? You’ve turned into a kemonomimi for {{d3}} days. (Animal up to you.)`,
                `Your hair changes color for {{d3}} days.`,
                `You’re shrinking! Shapeshift into a gnome for {{d2}} days.`,
                `Your skin turns a certain color for {{d24}} hours. /choose between red | green | blue.`,
                `You grow or shrink 10 centimeters for {{d24}} hours. /choose between grow | shrink.`
            ];
            let size;
            let rng;
            let embed;

            if(suit == 'heart' || suit == 'hearts'){
                size = heartchoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Hearts`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Let your voice be heard in the face of hardship, no matter the form.*\n\n${heartchoices[rng]}`);
            }
            else if(suit == 'club' || suit == 'clubs'){
                size = clubchoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Clubs`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Strong of heart and strong of body, one must endure all.*\n\n${clubchoices[rng]}`);
            }
            else if(suit == 'spade' || suit == 'spades'){
                size = spadechoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Spades`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Mind over matter. One must see what is within.*\n\n${spadechoices[rng]}`);
            }
            else if(suit == 'diamond' || suit == 'diamonds'){
                size = diamondchoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Spades`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Material possessions are fleeting, learn to let go.*\n\n${diamondchoices[rng]}`);
            }
            else{
                embed = new EmbedBuilder()
                    .setColor(0xEBBCA2)
                    .setDescription(`${suit} not a suit!`);
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

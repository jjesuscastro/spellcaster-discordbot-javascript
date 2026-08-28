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
                `You cannot speak for {{d24}} hours.`,
                `Your voice suddenly sounds incredibly high pitched — like you’ve inhaled helium. It lasts for {{d24}} hours.`,
                `You’ve hit puberty. Your voice keeps cracking for {{d24}} hours.`,
                `Everything you write down is spoken out loud by a magical voice. Lasts for {{d4}} hours.`,
                `You can only answer questions with another question for {{d6}} hours.`,
                `You cannot stop humming whenever you’re silent for longer than 20 seconds. Lasts {{d24}} hours.`,
                `You can only speak one word at a time for {{d24}} hours.`
            ];
            const clubchoices = [
                `Ice creeps from the card and onto your arm — your arm is useless for {{d24}} hours.`,
                `Wear some layers! You feel unnaturally cold for {{d3}} days.`,
                `Flowers bloom all over your hair and uniform. Plucking them off just makes more flowers appear. Lasts {{d3}} days.`,
                `Wear mittens! Your hands are unnaturally hot for {{d24}} hours.`,
                `Your dominant hand becomes clumsy and incoordinated for {{d2}} days.`,
                `Everywhere you go, you leave a trail of glitter. Lasts for {{d3}} days.`,
                `You glow in the dark for {{d3}} nights. Apologize to your roommates!`,
                `Everything feels 10x heavier to you for {{d24}} hours.`
            ];
            const diamondchoices = [
                `Transfer 250 edels to the winner.`,
                `Transfer 100 edels to the winner.`,
                `Your bed mysteriously disappears for {{d3}} days.`,
                `Your books start screaming whenever you open it. Lasts for {{d6}} hours.`,
                `Your uniform is suddenly one size too small. Lasts for {{d24}} hours.`,
                `Your belongings swap places whenever you aren’t looking for {{d12}} hours.`,
                `Everything you own smells a little badly for {{d12}} hours.`,
                `Animals keep trying to steal your things for {{d12}} hours.`
            ];
            const spadechoices = [
                `Are those animal ears? You’ve turned into a kemonomimi for {{d3}} days. (Animal up to you.)`,
                `Your hair changes color for {{d3}} days.`,
                `You’re shrinking! Shapeshift into a gnome for {{d2}} days.`,
                `Your skin turns a certain color for {{d24}} hours. /choose between red | green | blue.`,
                `You grow or shrink 10 centimeters for {{d24}} hours. /choose between grow | shrink.`,
                `A small dark cloud looms over you and occasionally starts raining at random intervals. Lasts for {{d3}} days.`,
                `You look much, much older for {{d2}} days.`,
                `Where are you? You turn invisible for {{d3}} days.`
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
                    .setTitle(`✧ Diamonds`)
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

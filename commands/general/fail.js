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
                `a`,
                `b`,
            ];
            const clubchoices = [
                `a`,
                `b`,
            ];
            const spadechoices = [
                `a`,
                `b`,
            ];
            const diamondchoices = [
                `a`,
                `b`,
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
                    .setDescription(`*Let your voice be heard in the face of hardship, no matter the form.*\n${heartchoices[rng]}`);
            }
            else if(suit == 'club' || suit == 'clubs'){
                size = clubchoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Clubs`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Strong of heart and strong of body, one must endure all.*\n${clubchoices[rng]}`);
            }
            else if(suit == 'spade' || suit == 'spades'){
                size = spadechoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Spades`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Mind over matter. Illusions are all but temporary. One must see what is within.*\n${spadechoices[rng]}`);
            }
            else if(suit == 'diamond' || suit == 'diamonds'){
                size = diamondchoices.length;
                rng = Math.floor(Math.random() * size);

                embed = new EmbedBuilder()
                    .setTitle(`✧ Spades`)
                    .setColor(0xEBBCA2)
                    .setDescription(`*Material possessions are fleeting, learn to let go.*\n${diamondchoices[rng]}`);
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

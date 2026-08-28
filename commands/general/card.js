const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test2')
        .setDescription('you no no see')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            const imageUrls = [
                'https://i.imgur.com/wfzpsHb.png', //club
                'https://i.imgur.com/I4DnT8O.png',
                'https://i.imgur.com/CSkh5Qx.png',
                'https://i.imgur.com/BbKzOSX.png',

                'https://i.imgur.com/Y2sCQhw.png', //diamond
                'https://i.imgur.com/Eb8bkDg.png',
                'https://i.imgur.com/tntphuO.png',
                'https://i.imgur.com/iw0q2UB.png',
                
                'https://i.imgur.com/SF95LX4.png', //hearts
                'https://i.imgur.com/U6WI949.png',
                'https://i.imgur.com/BeYn46O.png',
                'https://i.imgur.com/juQv5ND.png',
                
                'https://i.imgur.com/uoxyQ8r.png', //spades
                'https://i.imgur.com/pi79wrg.png',
                'https://i.imgur.com/wruosrA.png',
                'https://i.imgur.com/zhxk2Ex.png',
            ];
            // const imageUrls = [
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}',
            //     'https://cataas.com/cat?timestamp=${Date.now()}'
            // ];

            const canvas = createCanvas(262, 400);
            const ctx = canvas.getContext('2d');

            const size = imageUrls.length;
            let imagenum; 

            // Draw each image onto the grid coordinates
            const positions = [
                { x: 0, y: 0 },     // Top-left
            ];

            for (let i = 0; i < positions.length; i++) {

                imagenum = Math.floor(Math.random() * size); 
                
                const img = await loadImage(imageUrls[imagenum]);
                ctx.drawImage(img, positions[i].x, positions[i].y, 262, 400);
            }

            // Convert canvas to a Discord attachment buffer
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'grid.png' });

            await interaction.editReply({ 
                content: `Here's your card', <@${interaction.user.id}>!`,
                files: [attachment] 
            });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

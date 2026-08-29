const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('generate your house of cards set!'),

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

            const canvas = createCanvas(393, 600);
            const ctx = canvas.getContext('2d');

            const size = imageUrls.length;
            let imagenum; 

            // Draw each image onto the grid coordinates
            const positions = [
                { x: 0, y: 0 },     // Top-left
                { x: 131, y: 0 },   // Top-middle
                { x: 262, y: 0 },   // Top-right
                { x: 0, y: 200 },     // middle-left
                { x: 131, y: 200 },   // middle-middle
                { x: 262, y: 200 },   // middle-right
                { x: 0, y: 400 },   // Bottom-left
                { x: 131, y: 400 },   // Bottom-middle
                { x: 262, y: 400 }  // Bottom-right
            ];

            for (let i = 0; i < positions.length; i++) {

                imagenum = Math.floor(Math.random() * size); 
                
                const img = await loadImage(imageUrls[imagenum]);
                ctx.drawImage(img, positions[i].x, positions[i].y, 131, 200);
            }

            // Convert canvas to a Discord attachment buffer
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'grid.png' });

            await interaction.editReply({ 
                content: `Here are your cards, <@${interaction.user.id}>!`,
                files: [attachment] 
            });
        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    },
};

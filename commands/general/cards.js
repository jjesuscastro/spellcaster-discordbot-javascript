const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
/*
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('Generates and sends a 2x2 grid of images'),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            // Load 4 images from URLs or local paths
            const imageUrls = [
            //    'https://cdn.discordapp.com/attachments/1513952869273829438/1541872009649066024/e1_card.png?ex=6a8f2bb5&is=6a8dda35&hm=16282ab051926b7c64e86d2737052782731d4880f10a1ae989c76e6d26a868e4&',
            //    'https://cdn.discordapp.com/attachments/1513952869273829438/1541872010043457707/e1_card2.png?ex=6a8f2bb5&is=6a8dda35&hm=36dbd3844e363a1fd467d98bca0ad89fbc7b96205ed560705db7d5fc91614352&',
            //    'https://cdn.discordapp.com/attachments/1513952869273829438/1541872010391592960/e1_card3.png?ex=6a8f2bb5&is=6a8dda35&hm=ea307761f87b3a7a85ab05c6511b6919a6acd012d692f8dfe0053e3c4af9dcad&',
            //    'https://cdn.discordapp.com/attachments/1513952869273829438/1541872010764755035/e1_card4.png?ex=6a8f2bb5&is=6a8dda35&hm=178b611a4cb55ae65bb53758eae4fd5c545f89012cf6479053710e83bcc059d6&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1541872549141545090/e1_card2.png?ex=6a8f2c36&is=6a8ddab6&hm=62fdf57d112257062a6f0dccc007aa2f12185d5eecc920c8d1715ae69f0426b8&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1541872549766365327/e1_card3.png?ex=6a8f2c36&is=6a8ddab6&hm=32963afb7f36f490c9228e7e5adc4db27569fa1fcc479a5a4d55c91e864c0394&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1541872550198517901/e1_card4.png?ex=6a8f2c36&is=6a8ddab6&hm=5f1c657c8e3e0859c30adcb3d736b7ffcb7d58d1b6e972606601cc3de936d3ce&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1541872550781395115/e1_card.png?ex=6a8f2c36&is=6a8ddab6&hm=4b8e79942dbc5f4db9e6240da213bea4fd31abf9542938792a795456f5badb55&'
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
*/
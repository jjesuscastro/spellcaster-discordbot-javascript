const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('Generates and sends a 2x2 grid of images'),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            // Load 4 images from URLs or local paths
            const imageUrls = [
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541821001153646652/image.png?ex=6a8efc34&is=6a8daab4&hm=1265040b9a68ed6c1d046a83dd546ae0dcfe7bd4aa91c8a6f2d85c0bb83822dd'
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

            const canvas = createCanvas(450, 600);
            const ctx = canvas.getContext('2d');

            // Draw each image onto the grid coordinates
            const positions = [
                { x: 0, y: 0 },     // Top-left
                { x: 150, y: 0 },   // Top-middle
                { x: 300, y: 0 },   // Top-right
                { x: 0, y: 200 },     // middle-left
                { x: 150, y: 200 },   // middle-middle
                { x: 300, y: 200 },   // middle-right
                { x: 0, y: 400 },   // Bottom-left
                { x: 150, y: 400 },   // Bottom-middle
                { x: 300, y: 400 }  // Bottom-right
            ];

            for (let i = 0; i < imageUrls.length; i++) {
                const img = await loadImage(imageUrls[i]);
                ctx.drawImage(img, positions[i].x, positions[i].y, 150, 200);
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

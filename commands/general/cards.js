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
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}',
                'https://cataas.com/cat?timestamp=${Date.now()}'
            ];

            // Create canvas for a 2x2 grid (each image 300x300, total 600x600)
            const canvas = createCanvas(600, 600);
            const ctx = canvas.getContext('2d');

            // Draw each image onto the grid coordinates
            const positions = [
                { x: 0, y: 0 },     // Top-left
                { x: 200, y: 0 },   // Top-middle
                { x: 400, y: 0 },   // Top-right
                { x: 0, y: 200 },     // middle-left
                { x: 200, y: 200 },   // middle-middle
                { x: 400, y: 200 },   // middle-right
                { x: 0, y: 400 },   // Bottom-left
                { x: 200, y: 400 },   // Bottom-middle
                { x: 400, y: 400 }  // Bottom-right
            ];

            for (let i = 0; i < imageUrls.length; i++) {
                const img = await loadImage(imageUrls[i]);
                ctx.drawImage(img, positions[i].x, positions[i].y, 200, 200);
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

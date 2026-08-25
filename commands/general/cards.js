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
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870',
                'https://cdn.discordapp.com/attachments/1515938074914197596/1541820031090954320/card.png?ex=6a8efb4d&is=6a8da9cd&hm=823006e5e4b078c58561fdd072605953a2e5b430c5f365147bb010e1ed088870'
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

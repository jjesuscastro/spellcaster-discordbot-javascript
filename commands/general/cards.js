const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('you no no see')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            // Load 4 images from URLs or local paths
            const imageUrls = [
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542483382787772446/1.png?ex=6a916518&is=6a901398&hm=afc1e38f75e7b8d6a31f469a115c28725f3d5c07a72c24c58dcb76db6208a944&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542483383265787984/5.png?ex=6a916518&is=6a901398&hm=f17bfeb85eb71aadcc945598e0f71fe70ce5bdba87d8852026b4e2119fa71c8d&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542483383903588462/6.png?ex=6a916518&is=6a901398&hm=cc51c52547f5324f231859304ee5a0a998b6225ff3a3762c6bb97304411bd235&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542483384725413918/7.png?ex=6a916518&is=6a901398&hm=e359eccdccbd570433de51cc253fe96c5df6e10f28e2d3bf2134e7e1dd74c728&',
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

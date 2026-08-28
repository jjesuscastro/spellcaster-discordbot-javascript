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
            // Load 4 images from URLs or local paths
            const imageUrls = [
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542513979425820853/club_1.png?ex=6a918197&is=6a903017&hm=aaa06c30c6a67e40679aab7cf1e3a9b03fee937b9aa0ac98839f266973c58fd5&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542513979853770792/club_2.png?ex=6a918197&is=6a903017&hm=498a2231b02ee1c4b8acdeebd1ace7098dc14cc55212900da5eb9c9a6ab26374&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542513980243968011/club_3.png?ex=6a918197&is=6a903017&hm=e8f706258bacfbb85b5fdb2381600aabf0304929a33156206d76d6c2cf1f1898&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542513980642431136/club_4.png?ex=6a918197&is=6a903017&hm=f6bf1786bd1f2950405623fffe7e2b971615dc6b7d2239a08347c6609838b7d6&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514003933397083/diamond_1.png?ex=6a91819d&is=6a90301d&hm=4ef7d55ce7a5d14f50a10fbb7f0bd41c18afc90b07deaad09f6e207f4e1ff23b&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514004390314105/diamond_2.png?ex=6a91819d&is=6a90301d&hm=005357e51ed65322f10656d86a5d2c10144939745e3fd522dc23cb1557c3b615&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514004931645501/diamond_3.png?ex=6a91819d&is=6a90301d&hm=153b052341fccbdf63a48871ee6cccfaa7b07d57f9f29cc7ddd504ddfc2691a5&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514024787353610/heart_1.png?ex=6a9181a2&is=6a903022&hm=b620c5cc24f822d839800a3d8325e99fa8be63302d205016def2d631b97c3560&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514025160773723/heart_2.png?ex=6a9181a2&is=6a903022&hm=3bfd9ef0d625cc9ca02574822ccb861e5b66f1c7a88e7babf08833c574f1e5f2&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514025512837220/heart_3.png?ex=6a9181a2&is=6a903022&hm=d6331e10140a9052c5ca20f6b2e4ac8dbac8c33d87fd3de5d83a3a401c1bfde5&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514025970012311/heart_4.png?ex=6a9181a2&is=6a903022&hm=5450d5812f3969f5e26ad5fccb070ccbedc650bd641c60199a8c5fc2bf71dd4a&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514110011547708/spade_1.png?ex=6a9181b6&is=6a903036&hm=d4c7fe1d65db900b542b2d761b3624e16eb5cf56b27664c57de332455135f18e&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514110510534776/spade_2.png?ex=6a9181b6&is=6a903036&hm=a6a41af1384168061bce8ebf714016badc85cc8cb794398f98d6b60b100c775a&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514110888153159/spade_3.png?ex=6a9181b6&is=6a903036&hm=8d7f7c8e24616eda48fafaabf91f4a56267c189cfbd9460bb24181659b534349&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514111231823892/spade_4.png?ex=6a9181b6&is=6a903036&hm=312e1a80c6ef5ef064aabc834864e52ede56854e757e3b5d7160ad7112c0c8b7&',
                'https://cdn.discordapp.com/attachments/1513952869273829438/1542514005367722044/diamond_4.png?ex=6a91819d&is=6a90301d&hm=1408f80b274f4b0214cac0d255cca1ecd445ba8d6130a105878d8d93dfef5377&',
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

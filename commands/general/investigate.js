const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getStories, getStoryByKey } = require('../../utils/investigationStories');

const CUSTOM_ID_PREFIX = 'investigate:';

function renderNode(storyKey, node, callerId) {
    if (node.ending === true) return { content: node.text, components: [] };

    const buttons = node.choices.map((choice, index) => new ButtonBuilder()
        .setCustomId(`${CUSTOM_ID_PREFIX}${storyKey}:${node.id}:${choice.next}:${callerId}:${index}`)
        .setLabel(choice.label)
        .setStyle(ButtonStyle.Primary));
    const rows = [];
    for (let index = 0; index < buttons.length; index += 5) {
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(index, index + 5)));
    }
    return { content: node.text, components: rows };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('investigate')
        .setDescription('Investigate a story and choose how it unfolds.')
        .addStringOption(option => option
            .setName('storyname')
            .setDescription('The story you want to investigate.')
            .setRequired(true)
            .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().trim().toLocaleLowerCase();
        const choices = getStories()
            .filter(({ story }) => story.name.toLocaleLowerCase().includes(focused))
            .slice(0, 25)
            .map(({ story }) => ({ name: story.name, value: story.name }));
        await interaction.respond(choices);
    },

    async execute(interaction) {
        const requestedName = interaction.options.getString('storyname').trim();
        const match = getStories().find(({ story }) => story.name.toLocaleLowerCase() === requestedName.toLocaleLowerCase());
        if (!match) {
            await interaction.reply({ content: `I couldn't find a story named "${requestedName}". Use autocomplete to see available stories.`, ephemeral: true });
            return;
        }
        const startNode = match.story.nodes[match.story.start];
        await interaction.reply(renderNode(match.key, { ...startNode, id: match.story.start }, interaction.user.id));
    },

    async handleButton(interaction) {
        const [, storyKey, sourceNodeId, nodeId, callerId, choiceIndex] = interaction.customId.split(':');
        if (interaction.user.id !== callerId) {
            await interaction.reply({ content: 'Only the person who started this investigation can choose what happens next.', ephemeral: true });
            return;
        }
        try {
            const found = getStoryByKey(storyKey);
            const targetNode = found?.story.nodes[nodeId];
            const sourceNode = found?.story.nodes[sourceNodeId];
            const validChoice = Array.isArray(sourceNode?.choices)
                && Number.isInteger(Number(choiceIndex))
                && sourceNode.choices[Number(choiceIndex)]?.next === nodeId;
            if (!targetNode || !validChoice) {
                await interaction.reply({ content: 'This story step is no longer available. Please start the investigation again.', ephemeral: true });
                return;
            }
            await interaction.update(renderNode(found.key, { ...targetNode, id: nodeId }, callerId));
        } catch (error) {
            await interaction.reply({ content: 'This story could not be loaded. Please try starting the investigation again later.', ephemeral: true });
            throw error;
        }
    },
};

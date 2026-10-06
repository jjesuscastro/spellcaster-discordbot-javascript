const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { randomBytes } = require('crypto');
const { getStories, getStoryByKey } = require('../../utils/investigationStories');

const CUSTOM_ID_PREFIX = 'investigate:';
const CAMPAIGN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const campaigns = new Map();

function createCampaign(storyKey, callerId, startNodeId) {
    const now = Date.now();
    for (const [id, campaign] of campaigns) {
        if (campaign.updatedAt + CAMPAIGN_TTL_MS <= now) campaigns.delete(id);
    }
    let id;
    do {
        id = randomBytes(4).toString('hex');
    } while (campaigns.has(id));
    const campaign = {
        id,
        storyKey,
        callerId,
        visitedNodes: new Set([startNodeId]),
        usedResponses: new Set(),
        updatedAt: now,
    };
    campaigns.set(id, campaign);
    return campaign;
}

function getChoiceTargets(choice) {
    if (Array.isArray(choice.next)) return choice.next;
    return typeof choice.next === 'string' ? [choice.next] : [];
}

function renderNode(node, campaign) {
    if (node.ending === true) return { content: node.text, components: [] };

    const buttons = node.choices.map((choice, index) => new ButtonBuilder()
        .setCustomId(`${CUSTOM_ID_PREFIX}${campaign.id}:${campaign.storyKey}:${node.id}:${campaign.callerId}:${index}`)
        .setLabel(choice.label)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(choice.next !== undefined
            ? getChoiceTargets(choice).every(target => campaign.visitedNodes.has(target))
            : campaign.usedResponses.has(`${node.id}:${index}`)));
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
        const campaign = createCampaign(match.key, interaction.user.id, match.story.start);
        const startNode = match.story.nodes[match.story.start];
        await interaction.reply(renderNode({ ...startNode, id: match.story.start }, campaign));
        if (startNode.ending === true) campaigns.delete(campaign.id);
    },

    async handleButton(interaction) {
        const [, campaignId, storyKey, sourceNodeId, callerId, choiceIndex] = interaction.customId.split(':');
        if (interaction.user.id !== callerId) {
            await interaction.reply({ content: 'Only the person who started this investigation can choose what happens next.', ephemeral: true });
            return;
        }
        try {
            const campaign = campaigns.get(campaignId);
            if (!campaign || campaign.callerId !== callerId || campaign.storyKey !== storyKey) {
                await interaction.reply({ content: 'This investigation has expired. Please start it again with /investigate.', ephemeral: true });
                return;
            }
            const found = getStoryByKey(storyKey);
            const sourceNode = found?.story.nodes[sourceNodeId];
            const numericChoiceIndex = Number(choiceIndex);
            const validIndex = Number.isInteger(numericChoiceIndex)
                && numericChoiceIndex >= 0
                && numericChoiceIndex < (sourceNode?.choices?.length ?? 0);
            if (!sourceNode || !validIndex) {
                await interaction.reply({ content: 'This story step is no longer available. Please start the investigation again.', ephemeral: true });
                return;
            }
            const selectedChoice = sourceNode.choices[numericChoiceIndex];
            const choiceKey = `${sourceNodeId}:${numericChoiceIndex}`;
            const availableTargets = getChoiceTargets(selectedChoice)
                .filter(target => !campaign.visitedNodes.has(target));
            if (selectedChoice.next !== undefined && availableTargets.length === 0) {
                await interaction.reply({ content: 'That option leads to a story step you have already visited.', ephemeral: true });
                return;
            }
            if (selectedChoice.next === undefined && campaign.usedResponses.has(choiceKey)) {
                await interaction.reply({ content: 'You already selected that option in this investigation.', ephemeral: true });
                return;
            }
            campaign.updatedAt = Date.now();

            if (selectedChoice.response !== undefined) {
                campaign.usedResponses.add(choiceKey);
                await interaction.update(renderNode({ ...sourceNode, id: sourceNodeId }, campaign));
                await interaction.followUp({ content: selectedChoice.response, ephemeral: true });
                return;
            }

            const destinationNodeId = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            const targetNode = found.story.nodes[destinationNodeId];
            if (!targetNode) {
                await interaction.reply({ content: 'This story step is no longer available. Please start the investigation again.', ephemeral: true });
                return;
            }
            campaign.visitedNodes.add(destinationNodeId);
            await interaction.update({
                content: sourceNode.text,
                embeds: [new EmbedBuilder().setDescription(`**You chose:** ${selectedChoice.label}`)],
                components: [],
            });
            await interaction.followUp(renderNode({ ...targetNode, id: destinationNodeId }, campaign));
            if (targetNode.ending === true) campaigns.delete(campaign.id);
        } catch (error) {
            const response = { content: 'This story could not be loaded. Please try starting the investigation again later.', ephemeral: true };
            if (interaction.replied || interaction.deferred) await interaction.followUp(response);
            else await interaction.reply(response);
            throw error;
        }
    },
};

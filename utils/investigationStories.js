const fs = require('fs');
const path = require('path');

const STORIES_DIR = path.join(__dirname, '..', 'data', 'stories');
const STORY_KEY_PATTERN = /^[a-z0-9_-]{1,20}$/i;
const NODE_ID_PATTERN = /^[a-z0-9_-]{1,20}$/i;
const MAX_CHOICES = 25;

function validateStory(story, storyKey) {
    const errors = [];
    if (!story || typeof story !== 'object' || Array.isArray(story)) return ['Story must be a JSON object.'];
    if (typeof story.name !== 'string' || !story.name.trim()) errors.push('Story needs a non-empty name.');
    if (story.name?.length > 100) errors.push('Story name must be 100 characters or fewer.');
    if (!STORY_KEY_PATTERN.test(storyKey)) errors.push('Story filename must use only letters, numbers, underscores, or hyphens (up to 20 characters).');
    if (typeof story.start !== 'string' || !NODE_ID_PATTERN.test(story.start)) errors.push('Story start must be a valid node ID.');
    if (!story.nodes || typeof story.nodes !== 'object' || Array.isArray(story.nodes)) {
        errors.push('Story needs a nodes object.');
        return errors;
    }
    if (!Object.hasOwn(story.nodes, story.start)) errors.push(`Starting node "${story.start}" does not exist.`);

    for (const [nodeId, node] of Object.entries(story.nodes)) {
        if (!NODE_ID_PATTERN.test(nodeId)) errors.push(`Node ID "${nodeId}" must use only letters, numbers, underscores, or hyphens (up to 20 characters).`);
        if (!node || typeof node !== 'object' || Array.isArray(node)) {
            errors.push(`Node "${nodeId}" must be an object.`);
            continue;
        }
        if (typeof node.text !== 'string' || !node.text.trim()) errors.push(`Node "${nodeId}" needs non-empty text.`);
        if (node.text?.length > 2000) errors.push(`Node "${nodeId}" text must be 2000 characters or fewer.`);
        if (node.ending === true) {
            if (node.choices !== undefined && (!Array.isArray(node.choices) || node.choices.length > 0)) errors.push(`Ending node "${nodeId}" cannot have choices.`);
            continue;
        }
        if (!Array.isArray(node.choices) || node.choices.length < 1) {
            errors.push(`Node "${nodeId}" needs at least one choice, or ending: true.`);
            continue;
        }
        if (node.choices.length > MAX_CHOICES) errors.push(`Node "${nodeId}" cannot have more than ${MAX_CHOICES} choices.`);
        for (const [index, choice] of node.choices.entries()) {
            if (!choice || typeof choice !== 'object' || Array.isArray(choice)) {
                errors.push(`Choice ${index + 1} in node "${nodeId}" must be an object.`);
                continue;
            }
            if (typeof choice.label !== 'string' || !choice.label.trim() || choice.label.length > 80) errors.push(`Choice ${index + 1} in node "${nodeId}" needs a label (1–80 characters).`);
            const hasNext = choice.next !== undefined;
            const hasResponse = choice.response !== undefined;
            if (hasNext === hasResponse) errors.push(`Choice ${index + 1} in node "${nodeId}" must have exactly one of next or response.`);
            if (hasNext && (typeof choice.next !== 'string' || !NODE_ID_PATTERN.test(choice.next))) errors.push(`Choice ${index + 1} in node "${nodeId}" needs a valid next node ID.`);
            else if (hasNext && !Object.hasOwn(story.nodes, choice.next)) errors.push(`Choice ${index + 1} in node "${nodeId}" points to missing node "${choice.next}".`);
            if (hasResponse && (typeof choice.response !== 'string' || !choice.response.trim())) errors.push(`Choice ${index + 1} in node "${nodeId}" needs non-empty response text.`);
            if (typeof choice.response === 'string' && choice.response.length > 2000) errors.push(`Response ${index + 1} in node "${nodeId}" must be 2000 characters or fewer.`);
        }
    }
    return errors;
}

function readStoryFile(filePath) {
    const storyKey = path.basename(filePath, '.json');
    const story = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const errors = validateStory(story, storyKey);
    if (errors.length) throw new Error(errors.join(' '));
    return { key: storyKey, story };
}

function getStories() {
    if (!fs.existsSync(STORIES_DIR)) return [];
    return fs.readdirSync(STORIES_DIR).filter(file => file.endsWith('.json')).sort((a, b) => a.localeCompare(b)).map(file => {
        try {
            return readStoryFile(path.join(STORIES_DIR, file));
        } catch (error) {
            console.error(`Skipping invalid investigation story ${file}: ${error.message}`);
            return null;
        }
    }).filter(Boolean);
}

function getStoryByKey(storyKey) {
    if (!STORY_KEY_PATTERN.test(storyKey)) return null;
    const filePath = path.join(STORIES_DIR, `${storyKey}.json`);
    if (!fs.existsSync(filePath)) return null;
    return readStoryFile(filePath);
}

module.exports = { getStories, getStoryByKey, validateStory };

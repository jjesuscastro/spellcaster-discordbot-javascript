const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pool, withTransaction } = require('./db');

const STAT_MODIFIERS = {
    int: 'INT',
    cha: 'CHA',
    wis: 'WIS',
    will: 'WILL',
    str: 'STR',
    dex: 'DEX',
};

function int(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function roll20() {
    return Math.floor(Math.random() * 20) + 1;
}

function buildCommand(name, description, options = []) {
    const data = new SlashCommandBuilder().setName(name).setDescription(description);
    for (const configure of options) configure(data);
    data.addStringOption(option => option
        .setName('character')
        .setDescription('Choose one of your characters if you have more than one.')
        .setAutocomplete(true)
        .setRequired(false));
    return data;
}

async function getOwnedCharacters(userId) {
    const result = await pool.query(
        `SELECT * FROM spellcaster_combat_characters
         WHERE discord_id = $1 ORDER BY character_name`,
        [String(userId)],
    );
    return result.rows;
}

async function getCharacterByName(name, client = pool) {
    const result = await client.query(
        `SELECT * FROM spellcaster_combat_characters
         WHERE lower(character_name) = lower($1)
         ORDER BY character_id LIMIT 1`,
        [name],
    );
    return result.rows[0] || null;
}

async function getActor(interaction, client = pool) {
    const characters = await getOwnedCharacters(interaction.user.id);
    if (!characters.length) {
        throw new Error('Your combat character is not set up yet. Wait for a mod to add it to the combat database.');
    }
    const name = interaction.options.getString('character');
    if (name) {
        const actor = characters.find(row => row.character_name.toLowerCase() === name.toLowerCase());
        if (!actor) throw new Error('That character is not linked to your Discord account.');
        return actor;
    }
    if (characters.length > 1) {
        throw new Error('You have multiple combat characters. Choose one with the character option.');
    }
    return characters[0];
}

async function requireAction(client, actor) {
    const result = await client.query(
        `SELECT action_used FROM spellcaster_combat_characters
         WHERE character_id = $1 FOR UPDATE`,
        [actor.character_id],
    );
    if (!result.rows[0]) throw new Error('Character not found.');
    if (result.rows[0].action_used) throw new Error('You have already used your action this turn. Use /newturn to begin your next turn.');
}

async function markAction(client, actor) {
    await client.query(
        'UPDATE spellcaster_combat_characters SET action_used = TRUE WHERE character_id = $1',
        [actor.character_id],
    );
}

async function changeResource(client, characterId, resource, amount, maximum) {
    const allowed = new Set(['hp', 'mp', 'shield']);
    if (!allowed.has(resource)) throw new Error('Invalid combat resource.');
    const maxColumn = maximum === 'max_mp' ? 'max_mp' : 'max_hp';
    const result = await client.query(
        `UPDATE spellcaster_combat_characters
         SET ${resource} = GREATEST(0, LEAST(${maxColumn}, ${resource} + $2))
         WHERE character_id = $1
         RETURNING ${resource}, ${maxColumn}`,
        [characterId, amount],
    );
    if (!result.rows[0]) throw new Error('Character not found.');
    return { value: result.rows[0][resource], maximum: result.rows[0][maxColumn] };
}

function getModifier(actor, key) {
    const value = actor.modifiers?.[key] ?? actor.stats?.[key] ?? 0;
    return int(value);
}

function describeRoll(die, modifier, total) {
    return `🎲 ${die} + ${modifier} = **${total}**`;
}

function renderStats(actor) {
    const stats = actor.stats || {};
    const statLines = Object.entries(stats).map(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const contents = Object.entries(value).map(([stat, amount]) => `**${stat.toUpperCase()}** ${amount}`).join(' · ');
            return `**${key.toUpperCase()}:** ${contents}`;
        }
        return `**${key.toUpperCase()}** ${value}`;
    });
    const modifierLines = Object.entries(actor.modifiers || {}).map(([key, value]) => `**${key.toUpperCase()} mod** ${value}`);
    const lines = [
        `**HP:** ${actor.hp}/${actor.max_hp}`,
        `**MP:** ${actor.mp}/${actor.max_mp}`,
        `**AC:** ${actor.armor_class}`,
        `**Shield:** ${actor.shield}`,
    ];
    if (statLines.length) lines.push(`**Stats:** ${statLines.join(' · ')}`);
    if (modifierLines.length) lines.push(`**Modifiers:** ${modifierLines.join(' · ')}`);
    const embed = new EmbedBuilder()
        .setTitle(`✧ ${actor.character_name}`)
        .setColor(0xB7B75F)
        .addFields(
            { name: '💊 **HP**', value: `\`\`\`${actor.hp}/${actor.max_hp}\`\`\``   || '—', inline: true },
            { name: '🪄 **MP**', value: `\`\`\`${actor.mp}/${actor.max_mp}\`\`\``   || '—', inline: true },
            { name: '🛡️ **AC**', value: `\`\`\`${actor.armor_class}\`\`\``          || '—', inline: true },
            { name: '✦ SPELL POINTS ✦',    value: ` `    || '—', inline: false },
            
        );
    return embed;
    //return `**${actor.character_name}**\n${lines.join('\n')}`;
}

async function reply(interaction, content) {
    const payload = { embeds: [content], allowedMentions: { parse: [] } };
    if (interaction.deferred || interaction.replied) return interaction.editReply(payload);
    return interaction.reply(payload);
}

async function executeSimple(interaction, commandName) {
    if (STAT_MODIFIERS[commandName]) {
        const actor = await getActor(interaction);
        const die = roll20();
        const modifier = getModifier(actor, STAT_MODIFIERS[commandName]);
        return reply(interaction, `**${actor.character_name} — ${STAT_MODIFIERS[commandName]} check**\n${describeRoll(die, modifier, die + modifier)}`);
    }

    if (commandName === 'stats') {
        const selectedUser = interaction.options.getUser('user');
        if (selectedUser) {
            const targets = await getOwnedCharacters(selectedUser.id);
            if (!targets.length) throw new Error('That user has no combat character configured.');
            //return reply(interaction, targets.map(renderStats).join('\n\n'));
            return reply(interaction, renderStats);
        }
    }

    const actor = await getActor(interaction);
    if (commandName === 'stats' || commandName === 'hp') {
        if(commandName === 'stats')
            return reply(interaction, renderStats(actor));
        else{
            const embed = new EmbedBuilder()
                .setTitle(`✧ ${actor.character_name}`)
                .setColor(0xB7B75F)
                .addFields(
                    { name: '💊 **HP**', value: `\`\`\`${actor.hp}/${actor.max_hp}\`\`\``   || '—', inline: true },
                    { name: '🪄 **MP**', value: `\`\`\`${actor.mp}/${actor.max_mp}\`\`\``   || '—', inline: true },
                    
                );
            return reply(interaction, embed);
        }
        //return reply(interaction, commandName === 'stats' ? renderStats(actor) : `**${actor.character_name}** — HP ${actor.hp}/${actor.max_hp} · MP ${actor.mp}/${actor.max_mp}`);
    }

    if (commandName === 'takedmg') {
        const damage = interaction.options.getInteger('damage');
        const result = await withTransaction(async client => {
            const shield = await client.query('SELECT shield FROM spellcaster_combat_characters WHERE character_id = $1 FOR UPDATE', [actor.character_id]);
            const absorbed = Math.min(shield.rows[0].shield, damage);
            if (absorbed) await client.query('UPDATE spellcaster_combat_characters SET shield = shield - $2 WHERE character_id = $1', [actor.character_id, absorbed]);
            const hp = await changeResource(client, actor.character_id, 'hp', -(damage - absorbed), 'max_hp');
            return { absorbed, hp };
        });
        return reply(interaction, `**${actor.character_name}** took ${damage} damage${result.absorbed ? ` (${result.absorbed} absorbed by shield)` : ''}. HP: **${result.hp.value}/${result.hp.maximum}**.`);
    }

    if (commandName === 'dodge' || commandName === 'block') {
        const damage = interaction.options.getInteger('damage');
        const ac = interaction.options.getInteger('ac');
        const key = commandName === 'dodge' ? 'FIN' : 'RES';
        const die = roll20();
        const modifier = getModifier(actor, key);
        const total = die + modifier;
        let taken = damage;
        let resultText = 'The hit lands.';
        if (commandName === 'dodge') {
            if (total >= ac) { taken = 0; resultText = 'You dodge completely.'; }
            else if (ac - total <= 3) { taken = Math.ceil(damage / 2); resultText = 'You narrowly miss the dodge and take half damage.'; }
        } else if (total > ac) {
            taken = Math.ceil(damage / 2);
            resultText = 'You block and take half damage.';
        }
        const hp = await withTransaction(async client => {
            await requireAction(client, actor);
            const shield = await client.query('SELECT shield FROM spellcaster_combat_characters WHERE character_id = $1', [actor.character_id]);
            const absorbed = Math.min(shield.rows[0].shield, taken);
            if (absorbed) await client.query('UPDATE spellcaster_combat_characters SET shield = shield - $2 WHERE character_id = $1', [actor.character_id, absorbed]);
            await markAction(client, actor);
            return changeResource(client, actor.character_id, 'hp', -(taken - absorbed), 'max_hp');
        });
        return reply(interaction, `**${actor.character_name}** ${resultText}\n${describeRoll(die, modifier, total)} vs AC ${ac}. HP: **${hp.value}/${hp.maximum}**.`);
    }

    if (commandName === 'attack') {
        const ac = interaction.options.getInteger('ac');
        const die = roll20();
        const modifier = getModifier(actor, 'MGT');
        const total = die + modifier;
        const hit = total > ac;
        const crit = total >= 20;
        const damage = hit ? (crit ? actor.attack_crit : actor.attack_base) : 0;
        await withTransaction(async client => { await requireAction(client, actor); await markAction(client, actor); });
        var result;
        if(hit)
            if (crit)
                result = `✅ **CRITICAL HIT!** You deal **${damage} damage**.`
            else
                result = `✅ **HIT!** You deal **${damage} damage**.`
        else
            result = `❌ **MISS...**`
        const embed = new EmbedBuilder()
                .setTitle(`✧ ATTACK`)
                .setColor(0xB7B75F)
                .setDescription(`⚔️ **Clementine August attacks!**\n\n> 🎲 ${die} + ${modifier} **mgt** ➜ \` ${total} \`\n> Enemy AC ➜ \` ${ac} \`\n\n${result}`);
        return reply(interaction, embed);
        //return reply(interaction, `**${actor.character_name} attacks**\n${describeRoll(die, modifier, total)} vs AC ${ac}: ${hit ? `${crit ? 'Critical hit!' : 'Hit!'} **${damage} damage**.` : 'Miss.'}`);
    }

    if (commandName === 'heal') {
        const targetName = interaction.options.getString('target');
        const target = targetName ? await getCharacterByName(targetName) : actor;
        if (!target) throw new Error('That character is not in the combat database.');
        const die = roll20();
        const modifier = getModifier(actor, 'ESN');
        const crit = die + modifier >= 20;
        const amount = crit ? actor.heal_crit : actor.heal_base;
        const healed = await withTransaction(async client => {
            await requireAction(client, actor);
            await markAction(client, actor);
            return changeResource(client, target.character_id, 'hp', amount, 'max_hp');
        });
        return reply(interaction, `**${actor.character_name}** ${crit ? 'critically ' : ''}heals **${target.character_name}** for ${amount} HP. (${healed.value}/${healed.maximum})`);
    }

    if (commandName === 'modbuff' || commandName === 'moddebuff') {
        const amount = interaction.options.getInteger('amount');
        const direction = commandName === 'modbuff' ? 1 : -1;
        const result = await pool.query(
            'UPDATE spellcaster_combat_characters SET skill_modifier = skill_modifier + $2 WHERE character_id = $1 RETURNING skill_modifier',
            [actor.character_id, amount * direction],
        );
        return reply(interaction, `**${actor.character_name}** skill modifier is now ${result.rows[0].skill_modifier >= 0 ? '+' : ''}${result.rows[0].skill_modifier}.`);
    }

    if (commandName === 'resetstats') {
        await pool.query(
            `UPDATE spellcaster_combat_characters SET hp = max_hp, mp = max_mp, shield = 0,
             skill_modifier = base_skill_modifier, cooldowns = '{}'::jsonb, active_effects = '[]'::jsonb,
             action_used = FALSE WHERE character_id = $1`,
            [actor.character_id],
        );
        return reply(interaction, `**${actor.character_name}** HP and MP restored; shield, cooldowns, active effects, and temporary skill modifier cleared.`);
    }

    if (commandName === 'statuseffects') {
        const cooldowns = actor.cooldowns || {};
        const skills = Array.isArray(actor.skills) ? actor.skills : [];
        const skillLines = skills.map((skill, index) => {
            const key = String(skill.slot ?? index + 1);
            const turns = int(cooldowns[key]);
            return `• ${skill.name || `Skill ${key}`}: ${turns > 0 ? `cooldown ${turns} turn(s)` : 'ready'}`;
        });
        const effects = Array.isArray(actor.active_effects) ? actor.active_effects : [];
        const effectLines = effects.map(effect => `• ${effect.label || effect.type}: ${effect.amount} for ${effect.remaining} turn(s)`);
        return reply(interaction, `**${actor.character_name} — Status effects**\n${skillLines.length ? skillLines.join('\n') : 'No skills configured.'}\n\n**Active effects**\n${effectLines.length ? effectLines.join('\n') : 'None.'}`);
    }

    if (commandName === 'newturn') {
        const tickMessages = [];
        const result = await withTransaction(async client => {
            const fresh = await client.query('SELECT cooldowns, active_effects FROM spellcaster_combat_characters WHERE character_id = $1 FOR UPDATE', [actor.character_id]);
            const cooldowns = fresh.rows[0].cooldowns || {};
            for (const key of Object.keys(cooldowns)) cooldowns[key] = Math.max(0, int(cooldowns[key]) - 1);
            const remaining = [];
            for (const effect of (fresh.rows[0].active_effects || [])) {
                const amount = int(effect.amount);
                if (effect.resource === 'hp' || effect.resource === 'mp') {
                    const resourceResult = await changeResource(client, actor.character_id, effect.resource, amount, effect.resource === 'hp' ? 'max_hp' : 'max_mp');
                    tickMessages.push(`${effect.label || effect.type}: ${amount >= 0 ? '+' : ''}${amount} ${effect.resource.toUpperCase()} (${resourceResult.value}/${resourceResult.maximum})`);
                } else if (effect.resource === 'damage') {
                    const hp = await changeResource(client, actor.character_id, 'hp', -Math.abs(amount), 'max_hp');
                    tickMessages.push(`${effect.label || 'Damage over time'}: ${Math.abs(amount)} damage (${hp.value}/${hp.maximum} HP)`);
                } else if (effect.resource === 'enemy_damage') {
                    tickMessages.push(`${effect.label || 'Damage over time'}: ${Math.abs(amount)} damage to the enemy`);
                }
                const turns = int(effect.remaining) - 1;
                if (turns > 0) remaining.push({ ...effect, remaining: turns });
            }
            const updated = await client.query(
                `UPDATE spellcaster_combat_characters SET turn_number = turn_number + 1,
                 action_used = FALSE, cooldowns = $2, active_effects = $3
                 WHERE character_id = $1 RETURNING turn_number`,
                [actor.character_id, JSON.stringify(cooldowns), JSON.stringify(remaining)],
            );
            return updated.rows[0].turn_number;
        });
        const embed = new EmbedBuilder()
                .setTitle(`Round ${result}.${tickMessages.length ? `\n${tickMessages.join('\n')}` : ''}`)
                .setColor(0xB7B75F);
        return reply(interaction, embed);

        //return reply(interaction, `**${actor.character_name}** begins turn ${result}.${tickMessages.length ? `\n${tickMessages.join('\n')}` : ''}`);
    }

    if (commandName === 'skill') {
        const slot = interaction.options.getInteger('skill');
        const skill = (actor.skills || []).find((item, index) => int(item.slot, index + 1) === slot);
        if (!skill) throw new Error('That skill slot is not configured.');
        const type = String(skill.type || '').toUpperCase();
        const targetName = interaction.options.getString('target');
        const target = targetName && targetName.toLowerCase() !== 'none' ? await getCharacterByName(targetName) : null;
        const ac = interaction.options.getInteger('ac');
        const die = roll20();
        const modifier = int(actor.skill_modifier);
        const total = die + modifier;
        const crit = total >= 20;
        const damage = crit ? int(skill.crit, int(skill.damage)) : int(skill.damage);
        const success = total > int(skill.threshold, 13);
        const cooldowns = { ...(actor.cooldowns || {}) };
        const key = String(slot);
        if (int(cooldowns[key]) > 0) throw new Error(`${skill.name || `Skill ${slot}`} is on cooldown for ${cooldowns[key]} more turn(s).`);
        if (actor.mp < int(skill.mpDrain)) throw new Error('Not enough MP to use that skill.');
        if (['DPS', 'DOT'].includes(type) && ac === null) throw new Error('Provide the enemy AC with the ac option.');
        if (['HEAL', 'HOT', 'MP', 'MOT', 'INTERCEPT', 'RALLY', 'WEAKEN'].includes(type) && !targetName) throw new Error('Choose a target with the target option.');
        if (targetName && targetName.toLowerCase() !== 'none' && !target) throw new Error('That target is not in the combat database.');
        const actionSucceeded = success && (!['DPS', 'DOT'].includes(type) || total > ac);

        const resultText = await withTransaction(async client => {
            await requireAction(client, actor);
            const current = await client.query('SELECT mp, cooldowns FROM spellcaster_combat_characters WHERE character_id = $1 FOR UPDATE', [actor.character_id]);
            if (current.rows[0].mp < int(skill.mpDrain)) throw new Error('Not enough MP to use that skill.');
            await client.query('UPDATE spellcaster_combat_characters SET mp = mp - $2 WHERE character_id = $1', [actor.character_id, int(skill.mpDrain)]);
            const cd = current.rows[0].cooldowns || {};
            const turnsActive = int(skill.turnsActive);
            cd[key] = int(skill.cooldown) + (['DOT', 'HOT', 'MOT'].includes(type) ? turnsActive : 0);
            await client.query('UPDATE spellcaster_combat_characters SET cooldowns = $2, action_used = TRUE WHERE character_id = $1', [actor.character_id, JSON.stringify(cd)]);

            if (!actionSucceeded) return `fails to use the skill (${describeRoll(die, modifier, total)}${['DPS', 'DOT'].includes(type) ? ` vs AC ${ac}` : '; needed 14+'}). Spends ${int(skill.mpDrain)} MP.`;

            if (type === 'DPS') return `Deals **${damage} damage**${crit ? ' (critical)' : ''} to the enemy.`;
            if (type === 'DOT') {
                const effects = actor.active_effects || [];
                effects.push({ type: 'DOT', resource: 'enemy_damage', amount: damage, remaining: Math.max(1, turnsActive), label: skill.name || `Skill ${slot}` });
                await client.query('UPDATE spellcaster_combat_characters SET active_effects = $2 WHERE character_id = $1', [actor.character_id, JSON.stringify(effects)]);
                return `Applies **${damage} damage per turn** for ${Math.max(1, turnsActive)} turns.`;
            }
            if (type === 'HEAL' || type === 'MP') {
                const resource = type === 'HEAL' ? 'hp' : 'mp';
                const targetCharacter = target || actor;
                const gained = await changeResource(client, targetCharacter.character_id, resource, damage, resource === 'hp' ? 'max_hp' : 'max_mp');
                return `Restores **${damage} ${resource.toUpperCase()}** to ${targetCharacter.character_name} (${gained.value}/${gained.maximum}).`;
            }
            if (type === 'HOT' || type === 'MOT') {
                const resource = type === 'HOT' ? 'hp' : 'mp';
                const targetCharacter = target || actor;
                const effects = targetCharacter.active_effects || [];
                effects.push({ type, resource, amount: damage, remaining: Math.max(1, turnsActive), label: skill.name || `Skill ${slot}` });
                await client.query('UPDATE spellcaster_combat_characters SET active_effects = $2 WHERE character_id = $1', [targetCharacter.character_id, JSON.stringify(effects)]);
                return `Restores **${damage} ${resource.toUpperCase()} per turn** to ${targetCharacter.character_name} for ${Math.max(1, turnsActive)} turns.`;
            }
            if (type === 'INTERCEPT') {
                const targetCharacter = target || actor;
                await client.query('UPDATE spellcaster_combat_characters SET shield = shield + $2 WHERE character_id = $1', [targetCharacter.character_id, damage]);
                return `Gives ${targetCharacter.character_name} **${damage} shield**.`;
            }
            if (type === 'RALLY' || type === 'WEAKEN') {
                const targetCharacter = target;
                const amount = Math.abs(damage) * (type === 'WEAKEN' ? -1 : 1);
                if (targetCharacter) {
                    await client.query('UPDATE spellcaster_combat_characters SET skill_modifier = skill_modifier + $2 WHERE character_id = $1', [targetCharacter.character_id, amount]);
                    return `${type === 'RALLY' ? 'Buffs' : 'Debuffs'} ${targetCharacter.character_name}'s skill modifier by ${amount > 0 ? '+' : ''}${amount}.`;
                }
                return `${type === 'RALLY' ? 'Rally' : 'Weaken'} effect declared (${amount > 0 ? '+' : ''}${amount}); target was set to None.`;
            }
            if (type === 'AGGRO' || type === 'STUN' || type === 'VULNERABLE') {
                return type === 'VULNERABLE' ? `Enemy AC is reduced by **${damage}**.` : `${type} succeeds.`;
            }
            throw new Error(`Unsupported skill type: ${type || '(empty)'}.`);
        });
        return reply(interaction, `**${actor.character_name} uses ${skill.name || `Skill ${slot}`}**\n${describeRoll(die, modifier, total)}${crit ? ' (critical)' : ''}\n${resultText}`);
    }

    throw new Error(`Unknown combat command: ${commandName}.`);
}

function makeCommand(name, description, optionConfigs = []) {
    return {
        data: buildCommand(name, description, optionConfigs),
        async autocomplete(interaction) {
            const focused = interaction.options.getFocused(true);
            let choices = [];
            if (focused.name === 'character') {
                choices = (await getOwnedCharacters(interaction.user.id)).map(row => row.character_name);
            } else if (focused.name === 'target') {
                const result = await pool.query('SELECT character_name FROM spellcaster_combat_characters ORDER BY character_name LIMIT 25');
                choices = result.rows.map(row => row.character_name);
                if (['rally', 'weaken'].includes(name) || name === 'skill') choices.unshift('None');
            } else if (focused.name === 'skill') {
                const actor = await getActor(interaction);
                choices = (actor.skills || []).map((skill, index) => ({ name: skill.name || `Skill ${index + 1}`, value: int(skill.slot, index + 1) }));
                return interaction.respond(choices.filter(choice => choice.name.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25));
            }
            const filtered = choices.filter(value => value.toLowerCase().includes(focused.value.toLowerCase())).slice(0, 25);
            return interaction.respond(filtered.map(value => ({ name: value, value })));
        },
        async execute(interaction) {
            try {
                await executeSimple(interaction, name);
            } catch (err) {
                const payload = { content: err.message || 'Combat command failed.', ephemeral: true };
                if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
                else await interaction.reply(payload);
            }
        },
    };
}

const optionalNumber = (name, description) => data => data.addIntegerOption(option => option.setName(name).setDescription(description).setMinValue(0).setRequired(false));
const requiredNumber = (name, description) => data => data.addIntegerOption(option => option.setName(name).setDescription(description).setMinValue(0).setRequired(true));
const requiredTarget = data => data.addStringOption(option => option.setName('target').setDescription('Character to target; omit where self-targeting is allowed.').setAutocomplete(true).setRequired(false));
const userOption = data => data.addUserOption(option => option.setName('user').setDescription('Whose character to view.').setRequired(false));

const commands = {
    stats: makeCommand('stats', 'Display a character\'s stats', [userOption]),
    int: makeCommand('int', 'Roll an INT check.'),
    cha: makeCommand('cha', 'Roll a CHA check.'),
    wis: makeCommand('wis', 'Roll a WIS check.'),
    will: makeCommand('will', 'Roll a WILL check.'),
    str: makeCommand('str', 'Roll a STR check.'),
    dex: makeCommand('dex', 'Roll a DEX check.'),
    hp: makeCommand('hp', 'Display your HP and MP.'),
    takedmg: makeCommand('takedmg', 'Apply damage to your character.', [requiredNumber('damage', 'Damage to take.')]),
    dodge: makeCommand('dodge', 'Try to dodge incoming damage.', [requiredNumber('damage', 'Incoming damage.'), requiredNumber('ac', 'Enemy attack total or AC to beat.')]),
    block: makeCommand('block', 'Block incoming damage.', [requiredNumber('damage', 'Incoming damage.'), requiredNumber('ac', 'Enemy AC.')]),
    attack: makeCommand('attack', 'Attack an enemy.', [requiredNumber('ac', 'Enemy AC.')]),
    heal: makeCommand('heal', 'Heal yourself or another character.', [requiredTarget]),
    newturn: makeCommand('newturn', 'Begin your next combat turn.'),
    resetstats: makeCommand('resetstats', 'Restore HP and MP and clear combat effects.'),
    modbuff: makeCommand('modbuff', 'Increase your skill modifier.', [requiredNumber('amount', 'Amount to add.')]),
    moddebuff: makeCommand('moddebuff', 'Decrease your skill modifier.', [requiredNumber('amount', 'Amount to subtract.')]),
    statuseffects: makeCommand('statuseffects', 'Display skill cooldowns and active effects.'),
    skill: makeCommand('skill', 'Use one of your character skills.', [
        data => data.addIntegerOption(option => option.setName('skill').setDescription('Choose a skill slot.').setAutocomplete(true).setRequired(true)),
        optionalNumber('ac', 'Enemy AC for DPS or DOT skills.'),
        requiredTarget,
    ]),
};

module.exports = { commands, makeCommand, getActor, getOwnedCharacters, getCharacterByName, renderStats };

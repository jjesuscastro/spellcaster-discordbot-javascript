CREATE TABLE IF NOT EXISTS spellcaster_combat_characters (
    character_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    discord_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    sheet_tab_name TEXT,
    max_hp INTEGER NOT NULL DEFAULT 0 CHECK (max_hp >= 0),
    hp INTEGER NOT NULL DEFAULT 0 CHECK (hp >= 0),
    max_mp INTEGER NOT NULL DEFAULT 0 CHECK (max_mp >= 0),
    mp INTEGER NOT NULL DEFAULT 0 CHECK (mp >= 0),
    armor_class INTEGER NOT NULL DEFAULT 0,
    shield INTEGER NOT NULL DEFAULT 0 CHECK (shield >= 0),
    base_skill_modifier INTEGER NOT NULL DEFAULT 0,
    skill_modifier INTEGER NOT NULL DEFAULT 0,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    modifiers JSONB NOT NULL DEFAULT '{}'::jsonb,
    attack_base INTEGER NOT NULL DEFAULT 0,
    attack_crit INTEGER NOT NULL DEFAULT 0,
    heal_base INTEGER NOT NULL DEFAULT 0,
    heal_crit INTEGER NOT NULL DEFAULT 0,
    skill_1_name TEXT,
    skill_1_type TEXT,
    skill_1_damage INTEGER,
    skill_1_crit INTEGER,
    skill_1_mp_drain INTEGER,
    skill_1_cooldown INTEGER,
    skill_1_turns_active INTEGER,
    skill_1_threshold INTEGER,
    skill_2_name TEXT,
    skill_2_type TEXT,
    skill_2_damage INTEGER,
    skill_2_crit INTEGER,
    skill_2_mp_drain INTEGER,
    skill_2_cooldown INTEGER,
    skill_2_turns_active INTEGER,
    skill_2_threshold INTEGER,
    skill_3_name TEXT,
    skill_3_type TEXT,
    skill_3_damage INTEGER,
    skill_3_crit INTEGER,
    skill_3_mp_drain INTEGER,
    skill_3_cooldown INTEGER,
    skill_3_turns_active INTEGER,
    skill_3_threshold INTEGER,
    skill_4_name TEXT,
    skill_4_type TEXT,
    skill_4_damage INTEGER,
    skill_4_crit INTEGER,
    skill_4_mp_drain INTEGER,
    skill_4_cooldown INTEGER,
    skill_4_turns_active INTEGER,
    skill_4_threshold INTEGER,
    cooldowns JSONB NOT NULL DEFAULT '{}'::jsonb,
    active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
    turn_number INTEGER NOT NULL DEFAULT 1 CHECK (turn_number >= 1),
    action_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_name)
);

ALTER TABLE spellcaster_combat_characters
    ADD COLUMN IF NOT EXISTS skill_1_name TEXT,
    ADD COLUMN IF NOT EXISTS skill_1_type TEXT,
    ADD COLUMN IF NOT EXISTS skill_1_damage INTEGER,
    ADD COLUMN IF NOT EXISTS skill_1_crit INTEGER,
    ADD COLUMN IF NOT EXISTS skill_1_mp_drain INTEGER,
    ADD COLUMN IF NOT EXISTS skill_1_cooldown INTEGER,
    ADD COLUMN IF NOT EXISTS skill_1_turns_active INTEGER,
    ADD COLUMN IF NOT EXISTS skill_1_threshold INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_name TEXT,
    ADD COLUMN IF NOT EXISTS skill_2_type TEXT,
    ADD COLUMN IF NOT EXISTS skill_2_damage INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_crit INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_mp_drain INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_cooldown INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_turns_active INTEGER,
    ADD COLUMN IF NOT EXISTS skill_2_threshold INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_name TEXT,
    ADD COLUMN IF NOT EXISTS skill_3_type TEXT,
    ADD COLUMN IF NOT EXISTS skill_3_damage INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_crit INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_mp_drain INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_cooldown INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_turns_active INTEGER,
    ADD COLUMN IF NOT EXISTS skill_3_threshold INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_name TEXT,
    ADD COLUMN IF NOT EXISTS skill_4_type TEXT,
    ADD COLUMN IF NOT EXISTS skill_4_damage INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_crit INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_mp_drain INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_cooldown INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_turns_active INTEGER,
    ADD COLUMN IF NOT EXISTS skill_4_threshold INTEGER;

-- Migrate rows from the previous JSON-array skills column before removing it.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'spellcaster_combat_characters'
          AND column_name = 'skills'
    ) THEN
        EXECUTE $migration$
            WITH old_skills AS (
                SELECT c.character_id,
                       COALESCE(NULLIF(item->>'slot', '')::INTEGER, ordinal::INTEGER) AS slot,
                       item
                FROM spellcaster_combat_characters c
                CROSS JOIN LATERAL jsonb_array_elements(
                    CASE WHEN jsonb_typeof(c.skills) = 'array' THEN c.skills ELSE '[]'::jsonb END
                ) WITH ORDINALITY AS old(item, ordinal)
            ), by_slot AS (
                SELECT character_id, jsonb_object_agg(slot::TEXT, item) AS skills
                FROM old_skills
                WHERE slot BETWEEN 1 AND 4
                GROUP BY character_id
            )
            UPDATE spellcaster_combat_characters c SET
                skill_1_name = COALESCE(c.skill_1_name, b.skills->'1'->>'name'),
                skill_1_type = COALESCE(c.skill_1_type, b.skills->'1'->>'type'),
                skill_1_damage = COALESCE(c.skill_1_damage, (b.skills->'1'->>'damage')::INTEGER),
                skill_1_crit = COALESCE(c.skill_1_crit, (b.skills->'1'->>'crit')::INTEGER),
                skill_1_mp_drain = COALESCE(c.skill_1_mp_drain, (b.skills->'1'->>'mpDrain')::INTEGER),
                skill_1_cooldown = COALESCE(c.skill_1_cooldown, (b.skills->'1'->>'cooldown')::INTEGER),
                skill_1_turns_active = COALESCE(c.skill_1_turns_active, (b.skills->'1'->>'turnsActive')::INTEGER),
                skill_1_threshold = COALESCE(c.skill_1_threshold, (b.skills->'1'->>'threshold')::INTEGER),
                skill_2_name = COALESCE(c.skill_2_name, b.skills->'2'->>'name'),
                skill_2_type = COALESCE(c.skill_2_type, b.skills->'2'->>'type'),
                skill_2_damage = COALESCE(c.skill_2_damage, (b.skills->'2'->>'damage')::INTEGER),
                skill_2_crit = COALESCE(c.skill_2_crit, (b.skills->'2'->>'crit')::INTEGER),
                skill_2_mp_drain = COALESCE(c.skill_2_mp_drain, (b.skills->'2'->>'mpDrain')::INTEGER),
                skill_2_cooldown = COALESCE(c.skill_2_cooldown, (b.skills->'2'->>'cooldown')::INTEGER),
                skill_2_turns_active = COALESCE(c.skill_2_turns_active, (b.skills->'2'->>'turnsActive')::INTEGER),
                skill_2_threshold = COALESCE(c.skill_2_threshold, (b.skills->'2'->>'threshold')::INTEGER),
                skill_3_name = COALESCE(c.skill_3_name, b.skills->'3'->>'name'),
                skill_3_type = COALESCE(c.skill_3_type, b.skills->'3'->>'type'),
                skill_3_damage = COALESCE(c.skill_3_damage, (b.skills->'3'->>'damage')::INTEGER),
                skill_3_crit = COALESCE(c.skill_3_crit, (b.skills->'3'->>'crit')::INTEGER),
                skill_3_mp_drain = COALESCE(c.skill_3_mp_drain, (b.skills->'3'->>'mpDrain')::INTEGER),
                skill_3_cooldown = COALESCE(c.skill_3_cooldown, (b.skills->'3'->>'cooldown')::INTEGER),
                skill_3_turns_active = COALESCE(c.skill_3_turns_active, (b.skills->'3'->>'turnsActive')::INTEGER),
                skill_3_threshold = COALESCE(c.skill_3_threshold, (b.skills->'3'->>'threshold')::INTEGER),
                skill_4_name = COALESCE(c.skill_4_name, b.skills->'4'->>'name'),
                skill_4_type = COALESCE(c.skill_4_type, b.skills->'4'->>'type'),
                skill_4_damage = COALESCE(c.skill_4_damage, (b.skills->'4'->>'damage')::INTEGER),
                skill_4_crit = COALESCE(c.skill_4_crit, (b.skills->'4'->>'crit')::INTEGER),
                skill_4_mp_drain = COALESCE(c.skill_4_mp_drain, (b.skills->'4'->>'mpDrain')::INTEGER),
                skill_4_cooldown = COALESCE(c.skill_4_cooldown, (b.skills->'4'->>'cooldown')::INTEGER),
                skill_4_turns_active = COALESCE(c.skill_4_turns_active, (b.skills->'4'->>'turnsActive')::INTEGER),
                skill_4_threshold = COALESCE(c.skill_4_threshold, (b.skills->'4'->>'threshold')::INTEGER)
            FROM by_slot b
            WHERE c.character_id = b.character_id
        $migration$;

        ALTER TABLE spellcaster_combat_characters DROP COLUMN skills;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS spellcaster_combat_characters_discord_id_idx
    ON spellcaster_combat_characters (discord_id);

CREATE OR REPLACE FUNCTION spellcaster_set_combat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spellcaster_combat_characters_set_updated_at
    ON spellcaster_combat_characters;
CREATE TRIGGER spellcaster_combat_characters_set_updated_at
BEFORE UPDATE ON spellcaster_combat_characters
FOR EACH ROW EXECUTE FUNCTION spellcaster_set_combat_updated_at();

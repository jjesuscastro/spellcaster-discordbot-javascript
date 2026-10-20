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
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    cooldowns JSONB NOT NULL DEFAULT '{}'::jsonb,
    active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
    turn_number INTEGER NOT NULL DEFAULT 1 CHECK (turn_number >= 1),
    action_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_name)
);

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

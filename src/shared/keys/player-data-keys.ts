export const PLAYER_DATA_KEYS = ["health", "mana", "stamina", "experience", "level"] as const;

export type PlayerDataKey = (typeof PLAYER_DATA_KEYS)[number];
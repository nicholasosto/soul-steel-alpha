export const ABILITY_KEYS = ["Melee", "Soul-Drain", "Earthquake", "Ice-Rain"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

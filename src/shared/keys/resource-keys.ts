export const RESOURCE_KEYS = ["Health", "Mana", "Stamina", "Experience"] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export const ATTRIBUTE_KEYS = ["vitality", "strength", "dexterity", "intelligence", "luck"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

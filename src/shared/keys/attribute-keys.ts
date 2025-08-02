export const ATTRIBUTE_KEYS = ["vitality", "strength", "agility", "intellect", "luck"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

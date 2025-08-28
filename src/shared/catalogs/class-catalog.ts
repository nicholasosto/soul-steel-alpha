/* ----- Character Class Types ----- */
export const CHARACTER_CLASS_TYPE_KEYS = ["PHYSICAL", "MAGICAL", "TECHNICAL", "MENTAL"] as const;
export type CharacterClassTypeKey = (typeof CHARACTER_CLASS_TYPE_KEYS)[number];

/* ----- Character Classes ----- */
export const CHARACTER_CLASS_KEYS = ["WARRIOR", "MAGE", "ROGUE", "CLERIC"] as const;
export type CharacterClassKey = (typeof CHARACTER_CLASS_KEYS)[number];

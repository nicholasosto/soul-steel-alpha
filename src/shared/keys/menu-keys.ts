export const MENU_KEYS = ["CharacterMenu", "SettingsMenu", "InventoryMenu"] as const;
export type MenuKey = (typeof MENU_KEYS)[number];

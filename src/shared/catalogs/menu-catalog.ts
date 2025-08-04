import { Value } from "@rbxts/fusion";
import { MenuKey } from "shared/keys";

export interface MenuMeta {
	displayName: string;
	icon: string;
}
export type MenuStateType = {
	ActiveMenu: Value<MenuKey>; // Currently active menu
};

export const MenuButtonCatalog: Record<MenuKey, MenuMeta> = {
	CharacterMenu: {
		displayName: "Character",
		icon: "rbxassetid://100274464430589",
	},
	SettingsMenu: {
		displayName: "Settings",
		icon: "rbxassetid://122289639886993",
	},
	InventoryMenu: {
		displayName: "Inventory",
		icon: "rbxassetid://132702292243603",
	},
} satisfies Record<MenuKey, MenuMeta>;

import { ButtonBarProps, HorizontalButtonBar } from "./ButtonBar";
import { IconButton } from "../../atoms/IconButton";
import { MenuButtonImageMap } from "shared/asset-ids";

const MenuButtons = {
	Character: IconButton({
		Name: "CharacterButton",
		icon: MenuButtonImageMap.Character,
		onClick: () => {
			print("Character button clicked");
		},
	}),
	Inventory: IconButton({
		Name: "InventoryButton",
		icon: MenuButtonImageMap.Inventory,
		onClick: () => {
			print("Inventory button clicked");
		},
	}),
	Settings: IconButton({
		Name: "SettingsButton",
		icon: MenuButtonImageMap.Settings,
		onClick: () => {
			print("Settings button clicked");
		},
	}),
};

export const MenuButtonBar = HorizontalButtonBar({
	Position: new UDim2(0.5, 0, 1, -50),
	buttons: [MenuButtons.Character, MenuButtons.Inventory, MenuButtons.Settings],
});

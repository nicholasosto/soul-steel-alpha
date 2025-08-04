import { HorizontalButtonBar } from "./ButtonBar";
import { MenuButton } from "client/client-ui/molecules/MenuButton";

const MenuButtons = {
	Character: MenuButton({
		menuKey: "CharacterMenu",
	}),
	Inventory: MenuButton({
		menuKey: "InventoryMenu",
	}),
	Settings: MenuButton({
		menuKey: "SettingsMenu",
	}),
};
export const MenuButtonBar = HorizontalButtonBar({
	Position: new UDim2(0, 0, 0, 250),
	AnchorPoint: new Vector2(0, 0),
	buttons: [MenuButtons.Character, MenuButtons.Inventory, MenuButtons.Settings],
});

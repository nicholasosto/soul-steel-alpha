import { HorizontalButtonBar } from "./ButtonBar";
import { MenuButton } from "client/client-ui/molecules/MenuButton";
import { CharacterPanelManager } from "../panels/CharacterPanelIntegration";

// Singleton instance for character panel management
let characterPanelManager: CharacterPanelManager | undefined;

function getCharacterPanelManager(): CharacterPanelManager {
	if (!characterPanelManager) {
		characterPanelManager = new CharacterPanelManager();
	}
	return characterPanelManager;
}

const MenuButtons = {
	Character: MenuButton({
		menuKey: "CharacterMenu",
		onClick: () => {
			getCharacterPanelManager().toggleCharacterPanel();
		},
	}),
	Inventory: MenuButton({
		menuKey: "InventoryMenu",
		onClick: () => {
			print("Inventory menu clicked - not implemented yet");
		},
	}),
	Settings: MenuButton({
		menuKey: "SettingsMenu",
		onClick: () => {
			print("Settings menu clicked - not implemented yet");
		},
	}),
};

export const MenuButtonBar = HorizontalButtonBar({
	Position: new UDim2(0, 0, 0, 250),
	AnchorPoint: new Vector2(0, 0),
	buttons: [MenuButtons.Character, MenuButtons.Inventory, MenuButtons.Settings],
});

// Export the character panel manager for external access if needed
export { getCharacterPanelManager };

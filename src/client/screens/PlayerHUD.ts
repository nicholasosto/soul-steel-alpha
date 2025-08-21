import { Children, New } from "@rbxts/fusion";
import { CharacterCardInstance } from "./hud-components";
import { AbilityBar } from "./hud-components/AbilityBar";
import { PlayerDataPanel } from "./panels";

export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		Enabled: true,
		DisplayOrder: 10,
		[Children]: {
			//Panel: PanelTest,
			CharacterInfoCard: CharacterCardInstance,
			AbilityBar: AbilityBar(["Earthquake", "Melee", "Ice-Rain", "Soul-Drain"]),
			PlayerPanel: PlayerDataPanel,
		},
	});
}

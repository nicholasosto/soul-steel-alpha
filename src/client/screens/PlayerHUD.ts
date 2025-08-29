import { Children, New } from "@rbxts/fusion";
import { PlayerDataPanel } from "./panels";
import { CurrencyDisplay, CharacterCardInstance, AbilityBar } from "./hud-components";
import { PlayerStateInstance } from "client/states";

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
			CurrencyDisplay: CurrencyDisplay({
				coins: PlayerStateInstance.Currency["Coins"],
				tombs: PlayerStateInstance.Currency["Tombs"],
			}),
			PlayerPanel: PlayerDataPanel(),
		},
	});
}

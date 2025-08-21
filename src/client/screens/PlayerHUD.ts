import { Children, New } from "@rbxts/fusion";
import { CharacterCardInstance } from "./hud-components";
import { AbilityBar } from "./hud-components/AbilityBar";
import { AttributeRow, PlayerDataPanel } from "./panels";
import { CurrencyDisplay } from "./hud-components/CurrencyDisplay";
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
				coins: PlayerStateInstance.getCurrency("Coins"),
				tombs: PlayerStateInstance.getCurrency("Tombs"),
			}),
			PlayerPanel: PlayerDataPanel(),
		},
	});
}

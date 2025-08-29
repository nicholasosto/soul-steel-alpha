import { Children, New } from "@rbxts/fusion";
import { CharacterCardInstance } from "./hud-components";
import { AbilityBar } from "./hud-components/AbilityBar";
import { PlayerDataPanel } from "./panels";
import { CurrencyDisplay } from "./hud-components/CurrencyDisplay";
import { AttributeDisplay } from "./hud-components/AttributeDisplay";
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

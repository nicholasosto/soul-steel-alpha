import { Children, New } from "@rbxts/fusion";
import { CharacterCardInstance } from "./hud-components";
import { AbilityBar } from "./hud-components/AbilityBar";
import { Panel, TextBox } from "@trembus/ss-fusion";
/* ---------------------------------- TEXT BOXES ---------------------------------- */
const PanelTest = Panel({
	Size: UDim2.fromScale(0.5, 0.5),
	Position: UDim2.fromScale(0.25, 0.25),
	shadow: "md",
	variant: "primary",
	children: [TextBox({})],
});
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
		},
	});
}

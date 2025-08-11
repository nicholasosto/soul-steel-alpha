import { Children, New, OnEvent } from "@rbxts/fusion";
import { AbilityController } from "client/controllers";

/* ---------------------------------- TEXT BOXES ---------------------------------- */
export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		DisplayOrder: 10,
		[Children]: {
			AbilityButton: New("TextButton")({
				Name: "AbilityButton",
				Text: "Ability",
				Size: new UDim2(0.1, 0, 0.1, 0),
				Position: new UDim2(0.5, 0, 0.5, 0),
				AnchorPoint: new Vector2(0.5, 0.5),
				BackgroundColor3: Color3.fromRGB(255, 0, 0),
				[OnEvent("Activated")]: () => {
					AbilityController.getInstance().activateAbility("Melee");
				},
			}),
		},
	});
}

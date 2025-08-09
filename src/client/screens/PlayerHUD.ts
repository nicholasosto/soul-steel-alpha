import Fusion, { Children, New } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { AbilityButtonBar, ResourceBars } from "client/client-ui/organisms";
import { TextBox, TextBoxProps } from "@trembus/ss-fusion";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

/* ---------------------------------- TEXT BOXES ---------------------------------- */
const playerName: TextBoxProps = {
	variant: "success",
};

export const PlayerHUD = New("ScreenGui")({
	Name: "PlayerHUD",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"],
		}),
		ResourceBars: ResourceBars({
			resourceKeys: ["Health", "Mana", "Stamina", "Experience"],
			Position: new UDim2(0.05, 0, 0.05, 0), // Positioning the resource bars at the bottom left
			Size: new UDim2(0.2, 0, 0.1, 0), // Adjust size as needed
		}),
	},
});

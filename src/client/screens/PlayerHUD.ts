import Fusion, { Children, New } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { ResourceBars } from "client/client-ui/organisms";
import { EnhancedAbilityButtonBarDemo } from "client/client-ui/organisms/button-bars/EnhancedAbilityButtonBarDemo";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

/* ---------------------------------- TEXT BOXES ---------------------------------- */

export const PlayerHUD = New("ScreenGui")({
	Name: "PlayerHUD",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		AbilityBarDemo: EnhancedAbilityButtonBarDemo,
		ResourceBars: ResourceBars({
			resourceKeys: ["Health", "Mana", "Stamina", "Experience"],
			Position: new UDim2(0.05, 0, 0.05, 0), // Positioning the resource bars at the bottom left
			Size: new UDim2(0.2, 0, 0.1, 0), // Adjust size as needed
		}),
	},
});

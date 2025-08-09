import Fusion, { Children, New } from "@rbxts/fusion";
import { Function } from "@rbxts/net/out/client";
import { Players } from "@rbxts/services";
import { AbilityButtonBar, ResourceBars } from "client/client-ui/organisms";
import { PlayerStateInstance } from "client/states";
import { CreateTabGroupExample } from "@trembus/ss-fusion";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

export const PlayerHUD = New("ScreenGui")({
	Name: "PlayerHUD",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		TabExample: CreateTabGroupExample(),
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

import { Players } from "@rbxts/services";
import { AbilityButtonBar, MenuButtonBar } from "./client-ui/organisms";
import { New, Children } from "@rbxts/fusion";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;

New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"], // Example abilities, replace with actual game abilities
		}),
	},
}) as ScreenGui;

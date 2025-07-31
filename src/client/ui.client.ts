import { Players } from "@rbxts/services";
import { AbilityButtonBar, HealthBar, MenuButtonBar } from "./client-ui/organisms";
import { New, Children } from "@rbxts/fusion";
import { MessageStateInstance } from "./states/message-state";
import { MessageBox } from "./client-ui";
import { HealthStateInstance } from "./states/health-state";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;

New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
		HealthBar: HealthBar({
			resources: HealthStateInstance.playerResources,
			size: new UDim2(0.3, 0, 0.1, 0),
			position: new UDim2(0.35, 0, 0.05, 0),
		}),
		MessageBox: MessageBox(MessageStateInstance),
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"], // Example abilities, replace with actual game abilities
		}),
	},
}) as ScreenGui;

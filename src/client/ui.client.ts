import { Players } from "@rbxts/services";
import { AbilityButtonBar, ResourceBarDTO, MenuButtonBar } from "./client-ui/organisms";
import { New, Children } from "@rbxts/fusion";
import { MessageStateInstance } from "./states/message-state";
import { MessageBox } from "./client-ui";
import { PlayerResourceSlice } from "./states/player-resource-state";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;

// Create resource slice instance
const resourceSlice = new PlayerResourceSlice();
resourceSlice.fetch(); // Fetch initial data from server

New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
		ResourceBar: ResourceBarDTO({
			resourceSlice: resourceSlice,
			size: new UDim2(0.3, 0, 0.1, 0),
			position: new UDim2(0.35, 0, 0.05, 0),
		}),
		MessageBox: MessageBox(MessageStateInstance),
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"],
		}),
	},
}) as ScreenGui;

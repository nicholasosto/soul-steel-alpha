import { Players } from "@rbxts/services";
import { AbilityButtonBar, MenuButtonBar } from "./client-ui/organisms";
import { New, Children } from "@rbxts/fusion";
import { MessageStateInstance } from "./states/message-state";
import { MessageBox } from "./client-ui";
import { PlayerStateInstance } from "./states";
//import { ResourceBars } from "./client-ui/organisms/resource-bars/ResourceBars";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;


New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
		//ResourceBar: ResourceBars({ resourceKeys: ["Health", "Mana", "Stamina", "Experience"] }),
		MessageBox: MessageBox(MessageStateInstance),
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"],
		}),
	},
}) as ScreenGui;
print("PLAYERSTATEL :", PlayerStateInstance);
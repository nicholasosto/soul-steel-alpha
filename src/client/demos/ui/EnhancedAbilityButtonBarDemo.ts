/**
 * @file EnhancedAbilityButtonBarDemo.ts
 * @description Demo usage for AbilityButtonBar variants (now consolidated)
 */
import Fusion, { Children, New } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { VerticalLayout } from "client/client-ui/helpers";
import {
	AbilityButtonBar,
	CompactAbilityButtonBar,
	LargeAbilityButtonBar,
	AbilityButtonBarWithProgress,
} from "client/client-ui/organisms/button-bars/AbilityButtons";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

export const EnhancedAbilityButtonBarDemo = New("ScreenGui")({
	Name: "EnhancedAbilityButtonBarDemo",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 5,
	[Children]: {
		Layout: VerticalLayout(5),
		StandardBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"],
			variant: "standard",
			showLabels: true,
			position: new UDim2(0.5, 0, 0.8, 0),
			backgroundColor: Color3.fromRGB(30, 30, 40),
			backgroundTransparency: 0.2,
		}),
		CompactBar: CompactAbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee"],
			position: new UDim2(0.1, 0, 0.5, 0),
			backgroundColor: Color3.fromRGB(20, 25, 30),
		}),
		LargeBar: LargeAbilityButtonBar({
			keys: ["Soul-Drain", "Ice-Rain"],
			position: new UDim2(0.9, 0, 0.5, 0),
			showLabels: true,
			backgroundColor: Color3.fromRGB(40, 30, 50),
		}),
		ProgressBar: AbilityButtonBarWithProgress({ keys: ["Earthquake", "Melee"] }),
		Title: New("TextLabel")({
			Size: new UDim2(1, 0, 0, 50),
			Position: new UDim2(0, 0, 0, 20),
			Text: "Ability Button Bar Demo - Using ss-fusion Components",
			TextColor3: Color3.fromRGB(255, 255, 255),
			TextScaled: true,
			Font: Enum.Font.GothamBold,
			BackgroundTransparency: 1,
		}),
	},
});

task.spawn(() => {
	task.wait(10);
	if (EnhancedAbilityButtonBarDemo.Parent) {
		EnhancedAbilityButtonBarDemo.Parent = undefined;
		print("Enhanced Ability Button Bar Demo auto-hidden after 10 seconds");
	}
});

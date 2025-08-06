import { Players } from "@rbxts/services";
import { AbilityButtonBar, MenuButtonBar } from "./client-ui/organisms";
import { New, Children, Value } from "@rbxts/fusion";
import { MessageStateInstance } from "./states/message-state";
import { MessageBox } from "./client-ui";
import { PlayerStateInstance } from "./states";
import { ResourceBars } from "./client-ui/organisms/resource-bars/ResourceBars";
import { CooldownButton } from "./client-ui/molecules/cooldown-button/CooldownButton";
import { ImageConstants } from "shared";
//import { ResourceBars } from "./client-ui/organisms/resource-bars/ResourceBars";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;
let currentTime = os.clock();
const elapsedTime = Value(0);
task.spawn(() => {
	while (elapsedTime.get() < 60) {
		// Run for 60 seconds
		elapsedTime.set(os.clock() - currentTime);
		if (elapsedTime.get() >= 1) {
			currentTime = os.clock();
		}
		task.wait(0.1); // Update every 100ms
	}
});

New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
		//ResourceBar: ResourceBars({ resourceKeys: ["Health", "Mana", "Stamina", "Experience"] }),
		MessageBox: MessageBox(MessageStateInstance),
		CooldownButtonTest: CooldownButton({
			Name: "TestCooldownButton",
			Size: new UDim2(0, 100, 0, 100),
			icon: ImageConstants.Ability.Blood_Elemental,
			cooldown: 5, // 5 seconds cooldown
		}),
		AbilityBar: AbilityButtonBar({
			keys: ["Earthquake", "Ice-Rain", "Melee", "Soul-Drain"],
		}),
		ResourceBars: ResourceBars({
			resourceKeys: ["Health", "Mana", "Stamina", "Experience"],
			Position: new UDim2(0.05, 0, 0.8, 0), // Positioning the resource bars at the bottom left
			Size: new UDim2(0.2, 0, 0.1, 0), // Adjust size as needed
		}),
	},
}) as ScreenGui;
print("PLAYERSTATEL :", PlayerStateInstance);

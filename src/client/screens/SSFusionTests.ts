import { ProgressBar, TextBox, Button, CooldownButton } from "@trembus/ss-fusion";
import { New, Value, Children } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { ImageConstants } from "shared";
const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

const progressState = {
	current: Value(0),
	max: Value(100),
};
export const ssFusionUI = New("ScreenGui")({
	Name: "SSFusionUI",
	ResetOnSpawn: false,
	DisplayOrder: 10,
	Parent: Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui,
	[Children]: {
		ProgressBar: ProgressBar({
			progress: progressState.current,
			maxValue: progressState.max,
			Size: new UDim2(0.3, 0, 0.05, 0),
			Position: new UDim2(0.35, 0, 0.1, 0),
		}),
		TextBox: TextBox({
			Size: new UDim2(0.3, 0, 0.05, 0),
			Position: new UDim2(0.35, 0, 0.2, 0),
		}),
		Button: Button({
			text: "Click Me",
			Size: new UDim2(0.3, 0, 0.05, 0),
			Position: new UDim2(0.35, 0, 0.3, 0),
			onClick: () => {
				print("Button clicked!");
			},
		}),
		CooldownButton: CooldownButton({
			icon: ImageConstants.Ability.Blood_Siphon,
			Size: UDim2.fromOffset(70, 90),
			cooldown: 3,
			Position: new UDim2(0.35, 0, 0.4, 0),
		}),
	},
});

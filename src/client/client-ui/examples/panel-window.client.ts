import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { PanelWindow } from "../organisms/panels";
import { VStack } from "../atoms/Layout";
import { Avatar, Label } from "@trembus/ss-fusion";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

export function CreatePanelWindowExample() {
	const visible = Value(true);
	const gui = New("ScreenGui")({
		Name: "PanelWindowExample",
		ResetOnSpawn: false,
		DisplayOrder: 60,
		Parent: playerGui,
		[Children]: [
			Avatar({}),
			PanelWindow({
				Name: "InventoryPanel",
				title: "Inventory",
				visible,
				Size: new UDim2(0, 600, 0, 460),
				titlebarHeight: 40,
				Position: new UDim2(0.5, 0, 0.5, 0),
				AnchorPoint: new Vector2(0.5, 0.5),
				[Children]: [
					VStack({
						gap: 8,
						padding: 8,
						[Children]: [Label({ text: "Content goes here.", variant: "body" }) as unknown as Instance],
					}) as unknown as Instance,
				],
			}),
		],
	});
	return gui;
}

// Auto-create when module runs (for quick demo)
CreatePanelWindowExample();

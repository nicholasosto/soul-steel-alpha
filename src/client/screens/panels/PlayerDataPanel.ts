import { Computed, New, Value } from "@rbxts/fusion";
import { HStack, Label, Panel, PanelWindow, TextBox, VStack } from "@trembus/ss-fusion";
import { PlayerStateInstance } from "client/states";

export const PlayerDataPanel = () => {
	const isVisible = Value(true);

	return PanelWindow({
		Name: "PlayerDataPanel",
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: UDim2.fromScale(0.5, 0.5),
		Size: UDim2.fromOffset(500, 600),
		Visible: isVisible,
		closeButton: true,
		titleBarVariant: "secondary",
		onClose: () => isVisible.set(false),
		panelVariant: "secondary",
		titleLabel: "Player Data",
		shadow: "md",
		children: [],
	});
};

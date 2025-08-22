import { Computed, New, Value } from "@rbxts/fusion";
import { HStack, Label, Panel, PanelWindow, TextBox, VStack } from "@trembus/ss-fusion";
import { PlayerStateInstance } from "client/states";
import { ATTRIBUTE_KEYS, AttributeKey, AttributeCatalog } from "shared";
import { OxCard, OxCardContent, OxButton } from "@noxickon/onyx";

const oxCardTest = OxCard({
	title: "Test Card",
	children: [
		OxCardContent({
			children: [
				Label({
					text: "This is a test card",
				}),
				OxButton({
					text: "Click Me",
					onClick: () => {
						print("Test Card button clicked");
					},
				}),
			],
		}),
	],
});

export const PlayerDataPanel = () => {
	const isVisible = Value(true);

	return PanelWindow({
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
		children: [oxCardTest],
	});
};

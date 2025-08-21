import { Computed, New } from "@rbxts/fusion";
import { HStack, Label, Panel, PanelWindow, TextBox, VStack } from "@trembus/ss-fusion";
import { PlayerStateInstance } from "client/states";
import { ATTRIBUTE_KEYS, AttributeKey, AttributeCatalog } from "shared";

export const AttributeRow = (key: AttributeKey) => {
	const icon = New("ImageLabel")({
		Image: AttributeCatalog[key].icon,
		Size: UDim2.fromOffset(50, 50),
		BackgroundTransparency: 1,
	});

	const row = HStack({
		children: [
			icon,
			Label({
				variant: "body",
				Size: new UDim2(1, -50, 0, 50),
				// Use Computed to bind the current attribute value as text
				text: Computed(
					() => `${PlayerStateInstance.getAttributeValue(key).get()}`,
				) as unknown as import("@rbxts/fusion").Value<string>,
			}),
		],
	});
	const panel = Panel({
		padding: 2,
		Size: UDim2.fromOffset(200, 54),
		variant: "surface",
		children: [row],
	});
	return panel;
};

export const PlayerDataPanel = () => {
	const attributeRows = ATTRIBUTE_KEYS.map(AttributeRow);
	const attributeContainer = VStack({
		children: attributeRows,
	});

	return PanelWindow({
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: UDim2.fromScale(0.5, 0.5),
		panelVariant: "primary",
		titleLabel: "Player Data",
		shadow: "md",
		children: [attributeContainer],
	});
};

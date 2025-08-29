import { Computed, New, Value } from "@rbxts/fusion";
import {
	HStack,
	Label,
	Panel,
	PanelWindow,
	TextBox,
	VStack,
	Button,
	IconButton,
	ImageConstants,
} from "@trembus/ss-fusion";
import { PlayerStateInstance } from "client/states";
import { AttributeKey, AttributeCatalog } from "shared/catalogs/attribute-catalog";
import { AttributeRemotes } from "shared/network";

const ModifyAttribute = AttributeRemotes.Client.Get("ModifyAttribute");

interface AttributeRowProps {
	attributeKey: AttributeKey;
	availablePoints: Value<number>;
}

const AttributeRow = ({ attributeKey, availablePoints }: AttributeRowProps) => {
	const attribute = PlayerStateInstance.Attributes[attributeKey];
	const catalogEntry = AttributeCatalog[attributeKey];

	const currentValue = Computed(() => attribute.base.get());
	const canIncrease = Computed(() => availablePoints.get() > 0);

	const increaseAttribute = () => {
		if (canIncrease.get()) {
			ModifyAttribute.CallServerAsync(attributeKey, 1).catch((err) => {
				warn(`Failed to increase ${attributeKey}:`, err);
			});
		}
	};

	return HStack({
		Size: new UDim2(1, 0, 0, 40),
		children: [
			New("ImageLabel")({
				Name: "Icon",
				Size: new UDim2(0, 24, 0, 24),
				Image: catalogEntry.icon ?? "",
				BackgroundTransparency: 1,
			}),
			VStack({
				Size: new UDim2(0.6, 0, 1, 0),
				children: [
					Label({
						Name: "Name",
						text: catalogEntry.displayName,
						Size: new UDim2(1, 0, 0, 16),
						variant: "body",
						textStroke: true,
						textStrokeColor: Color3.fromRGB(0, 0, 0),
						TextXAlignment: Enum.TextXAlignment.Left,
						Font: Enum.Font.SourceSansBold,
					}),
					Label({
						Name: "Description",
						text: catalogEntry.description,
						variant: "heading",
						Size: new UDim2(1, 0, 0, 12),
						TextXAlignment: Enum.TextXAlignment.Left,
						TextSize: 10,
					}),
				],
			}),
			Label({
				Name: "Value",
				text: `${currentValue.get()}`,
				Size: new UDim2(0, 40, 0, 20),
				TextXAlignment: Enum.TextXAlignment.Center,
			}),
			IconButton({
				icon: ImageConstants.Control.Increment,
				Size: new UDim2(0, 30, 0, 30),
				onClick: increaseAttribute,
			}),
		],
	});
};

export const PlayerDataPanel = () => {
	const isVisible = Value(true);
	const availablePoints = PlayerStateInstance.Currency.AttributePoints;
	const attributeKeys: AttributeKey[] = ["Strength", "Agility", "Intelligence", "Vitality", "Spirit", "Luck"];

	return PanelWindow({
		Name: "PlayerDataPanel",
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: new UDim2(0.5, 0, 0.5, 0),
		Size: new UDim2(0, 600, 0, 500),
		Visible: isVisible,
		closeButton: true,
		titleBarVariant: "secondary",
		onClose: () => isVisible.set(false),
		panelVariant: "secondary",
		titleLabel: "Character Attributes",
		shadow: "md",
		children: [
			VStack({
				Name: "Content",
				Size: new UDim2(1, -40, 1, -80),
				Position: new UDim2(0, 20, 0, 60),
				children: [
					Label({
						Name: "PointsLabel",
						text: `Available Points: ${availablePoints.get()}`,
						Size: new UDim2(1, 0, 0, 30),
						TextSize: 16,
						Font: Enum.Font.SourceSansBold,
					}),
					VStack({
						Name: "AttributeList",
						Size: new UDim2(1, 0, 1, -40),
						children: attributeKeys.map((key) => AttributeRow({ attributeKey: key, availablePoints })),
					}),
				],
			}),
		],
	});
};

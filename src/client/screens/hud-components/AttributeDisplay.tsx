import { Computed, New } from "@rbxts/fusion";
import { AttributeKey, AttributeCatalog } from "shared/catalogs/attribute-catalog";
import { PlayerStateInstance } from "client/states";
import { HStack, Label, Panel, VStack } from "@trembus/ss-fusion";

interface AttributeRowProps {
	attributeKey: AttributeKey;
}

const AttributeRow = ({ attributeKey }: AttributeRowProps) => {
	const attribute = PlayerStateInstance.Attributes[attributeKey];
	const catalogEntry = AttributeCatalog[attributeKey];

	const baseValue = Computed(() => {
		return `Base: ${attribute.base.get()}`;
	});

	const totalValue = Computed(() => {
		return `Total: ${attribute.total.get()}`;
	});

	return HStack({
		Size: new UDim2(0, 300, 0, 30),
		children: [
			New("ImageLabel")({
				Name: "Icon",
				Size: new UDim2(0, 20, 0, 20),
				Image: catalogEntry.icon ?? "",
				BackgroundTransparency: 1,
			}),
			Label({
				Name: "NameLabel",
				text: catalogEntry.displayName,
				variant: "body",
				textStroke: true,
				Size: new UDim2(0, 100, 0, 20),
				TextXAlignment: Enum.TextXAlignment.Left,
			}),
			Label({
				Name: "BaseValue",
				text: baseValue.get(),
				Size: new UDim2(0, 80, 0, 20),
				TextXAlignment: Enum.TextXAlignment.Left,
			}),
			Label({
				Name: "TotalValue",
				text: totalValue.get(),
				Size: new UDim2(0, 80, 0, 20),
				TextXAlignment: Enum.TextXAlignment.Left,
				Font: Enum.Font.SourceSansBold,
			}),
		],
	});
};

export const AttributeDisplay = () => {
	const attributeKeys: AttributeKey[] = ["Strength", "Agility", "Intelligence", "Vitality", "Spirit", "Luck"];

	return Panel({
		Name: "AttributeDisplay",
		Size: new UDim2(0, 350, 0, 250),
		Position: new UDim2(0, 10, 0, 10),
		BackgroundColor3: Color3.fromRGB(30, 30, 30),
		BackgroundTransparency: 0.1,
		children: [
			New("UICorner")({
				CornerRadius: new UDim(0, 8),
			}),
			Label({
				Name: "Title",
				text: "Attributes",
				Size: new UDim2(1, 0, 0, 30),
				Position: new UDim2(0, 0, 0, 0),
				TextSize: 18,
				Font: Enum.Font.SourceSansBold,
			}),
			VStack({
				Name: "AttributeList",
				Size: new UDim2(1, -20, 1, -40),
				Position: new UDim2(0, 10, 0, 35),
				children: attributeKeys.map((key) => AttributeRow({ attributeKey: key })),
			}),
		],
	});
};

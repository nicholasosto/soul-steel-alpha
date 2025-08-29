import { Value } from "@rbxts/fusion";
import { PanelWindow } from "@trembus/ss-fusion";
import { PlayerStateInstance } from "client/states";
import { AttributeKey } from "shared/catalogs/attribute-catalog";
import { AttributeRemotes } from "shared/network";

const ModifyAttribute = AttributeRemotes.Client.Get("ModifyAttribute");

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
		children: [],
	});
};

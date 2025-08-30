import { PlayerStateInstance } from "client/states";
import { AttributeRow } from "../hud-components/AttributeRow";
import { Children, Computed, New, Value } from "@rbxts/fusion";
import { ATTRIBUTE_KEYS, AttributeState } from "shared";

export interface AttributesPanelProps {
	playerAttributesState: AttributeState;
	attributePoints: Value<number>;
}

export const AttributesPanel = (props: AttributesPanelProps) => {
	const attributePointsText = Computed(() => `Attribute Points: ${props.attributePoints.get()}`);
	const attributePointsLabel = New("TextLabel")({
		Text: attributePointsText.get(),
		Size: UDim2.fromScale(1, 0),
		BackgroundTransparency: 0.5,
		BackgroundColor3: Color3.fromRGB(0, 0, 0),
		TextColor3: Color3.fromRGB(255, 255, 255),
		TextSize: 20,
		TextStrokeColor3: Color3.fromRGB(0, 0, 0),
		TextStrokeTransparency: 0.7,
	});
	const attributeRows = ATTRIBUTE_KEYS.map((key) => {
		return AttributeRow({
			attributeKey: key,
			attributeState: props.playerAttributesState[key],
			onIncrement: () => {
				props.playerAttributesState[key].base.set(props.playerAttributesState[key].base.get() + 1);
			},
			onDecrement: () => {
				props.playerAttributesState[key].base.set(props.playerAttributesState[key].base.get() - 1);
			},
		});
	});

	const container = New("Frame")({
		Size: UDim2.fromOffset(400, 420),
		BackgroundColor3: Color3.fromRGB(255, 255, 255),
		BackgroundTransparency: 0.9,
		[Children]: {
			Corner: New("UICorner")({ CornerRadius: new UDim(0, 8) }),
			Layout: New("UIListLayout")({
				FillDirection: Enum.FillDirection.Vertical,
				HorizontalAlignment: Enum.HorizontalAlignment.Center,
				VerticalAlignment: Enum.VerticalAlignment.Top,
				HorizontalFlex: Enum.UIFlexAlignment.SpaceEvenly,
				VerticalFlex: Enum.UIFlexAlignment.SpaceEvenly,
				Padding: new UDim(0, 2),
			}),
			AttributePointsLabel: attributePointsLabel,
			AttributeRows: attributeRows,
		},
	});

	return container;
};

import Fusion, { New } from "@rbxts/fusion";
import { HorizontalLayout, makePadding } from "../../helpers";

const { Value } = Fusion;

export interface ButtonBarProps extends Fusion.PropertyTable<Frame> {
	buttons: Array<GuiButton | Frame>;
}

export function HorizontalButtonBar(props: ButtonBarProps) {
	const numButtons = props.buttons.size();
	const buttonSize = props.buttons[0].Size;
	const buttonSpacing = 5;
	const framePadding = 5;

	const barWidth = numButtons * (buttonSize.X.Offset + buttonSpacing) + framePadding * 2;
	const barHeight = buttonSize.Y.Offset + framePadding * 2;

	const uiComponent = New("Frame")({
		Name: "ButtonBar",
		Size: props.Size ?? new UDim2(0, barWidth, 0, barHeight),
		Position: props.Position ?? new UDim2(0.5, -barWidth / 2, 1, -barHeight - 10),
		AnchorPoint: props.AnchorPoint ?? new Vector2(0.5, 1),
		BackgroundTransparency: props.BackgroundTransparency ?? 0.5,
		BackgroundColor3: props.BackgroundColor3 ?? Color3.fromRGB(50, 50, 50),
		BorderSizePixel: props.BorderSizePixel ?? 0,
		ClipsDescendants: props.ClipsDescendants ?? true,
		[Fusion.Children]: [
			New("Frame")({
				Name: "ButtonContainer",
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				[Fusion.Children]: [
					props.buttons.map((button, index) => {
						return button;
					}),
					makePadding(framePadding), // Add padding around the button bar
					HorizontalLayout(5),
				],
			}),
		],
	});
	return uiComponent;
}

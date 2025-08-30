import { Value, Computed, New, ChildrenValue, Children, PropertyTable } from "@rbxts/fusion";
export interface StateLabelProps extends PropertyTable<TextLabel> {
	stateValue: Value<number | string>;
}

export function StateLabel(props: StateLabelProps) {
	const computedText = Computed(() => `${props.stateValue.get()}`);
	return New("TextLabel")({
		Name: props.Name ?? "StateLabel",
		Size: new UDim2(0, 50, 1, 0),
		BackgroundTransparency: 1,
		Text: computedText,
		TextColor3: Color3.fromRGB(255, 255, 255),
		Font: Enum.Font.SourceSans,
		TextSize: 18,
		LayoutOrder: props.LayoutOrder,
		[Children]: [props.____FusionChildren],
	});
}

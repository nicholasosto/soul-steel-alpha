import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { Label } from "@trembus/ss-fusion";
import { CloseButton } from "../atoms/CloseButton";

export interface TitleBarProps extends Fusion.PropertyTable<Frame> {
	title: string | Value<string>;
	onClose?: () => void;
	height?: number; // px
}

/** TitleBar with a left-aligned title and right-aligned CloseButton */
export function TitleBar(props: TitleBarProps): Frame {
	const HEIGHT = props.height ?? 28;
	return New("Frame")({
		Name: props.Name ?? "TitleBar",
		Size: new UDim2(1, 0, 0, HEIGHT),
		BackgroundColor3: Color3.fromRGB(34, 34, 38),
		BorderSizePixel: 0,
		[Children]: [
			Label({
				text: props.title,
				variant: "body",
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				TextXAlignment: Enum.TextXAlignment.Left,
			}) as unknown as Instance,

			CloseButton({
				onClick: props.onClose,
			}),
		],
	});
}

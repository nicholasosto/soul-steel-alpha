import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { TitleBar } from "../../molecules/TitleBar";

export interface PanelWindowProps extends Fusion.PropertyTable<Frame> {
	title: string | Value<string>;
	visible?: Value<boolean>;
	onClose?: () => void;
	contentPadding?: number;
	titlebarHeight?: number;
	ZIndex?: number;
}

/** PanelWindow - container with titlebar + close and content slot */
export function PanelWindow(props: PanelWindowProps): Frame {
	const visible = props.visible ?? Value(true);
	const titlebarHeight = props.titlebarHeight ?? 28;
	const padding = props.contentPadding ?? 8;
	const z = props.ZIndex ?? 10;

	return New("Frame")({
		Name: props.Name ?? "PanelWindow",
		Size: props.Size ?? new UDim2(0, 320, 0, 220),
		Position: props.Position ?? new UDim2(0.5, 0, 0.5, 0),
		AnchorPoint: props.AnchorPoint ?? new Vector2(0.5, 0.5),
		BackgroundColor3: Color3.fromRGB(28, 28, 30),
		BorderSizePixel: 0,
		Visible: visible,
		ZIndex: z,
		[Children]: [
			New("UICorner")({ CornerRadius: new UDim(0, 8) }),
			New("UIStroke")({ Color: Color3.fromRGB(70, 70, 75), Thickness: 1, Transparency: 0.2 }),
			TitleBar({
				Name: "TitleBar",
				height: titlebarHeight,
				title: props.title,
				onClose: () => {
					visible.set(false);
					props.onClose?.();
				},
				LayoutOrder: 1,
			}) as unknown as Instance,
			New("Frame")({
				Name: "Content",
				BackgroundColor3: Color3.fromRGB(36, 36, 40),
				BorderSizePixel: 0,
				Position: new UDim2(0, 0, 0, titlebarHeight),
				Size: new UDim2(1, 0, 1, -titlebarHeight),
				LayoutOrder: 2,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0, 8) }),
					New("UIPadding")({
						PaddingTop: new UDim(0, padding),
						PaddingBottom: new UDim(0, padding),
						PaddingLeft: new UDim(0, padding + 4),
						PaddingRight: new UDim(0, padding + 4),
					}),
					props[Children],
				],
			}),
		],
	});
}

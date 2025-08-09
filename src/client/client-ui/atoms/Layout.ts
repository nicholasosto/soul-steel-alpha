import Fusion, { Children, New } from "@rbxts/fusion";

type Align = "start" | "center" | "end";
type Justify = "start" | "center" | "end" | "spaceBetween" | "spaceEvenly";

export interface StackProps extends Fusion.PropertyTable<Frame> {
	direction?: "vertical" | "horizontal";
	gap?: number;
	padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
	align?: Align; // cross-axis alignment
	justify?: Justify; // main-axis distribution (uses UIFlex)
	scroll?: boolean; // wrap children in ScrollingFrame if true
	autoSize?: "none" | "x" | "y" | "both";
}

function toAlignment(align?: Align) {
	const a = align ?? "start";
	const hmap: Record<Align, Enum.HorizontalAlignment> = {
		start: Enum.HorizontalAlignment.Left,
		center: Enum.HorizontalAlignment.Center,
		end: Enum.HorizontalAlignment.Right,
	};
	const vmap: Record<Align, Enum.VerticalAlignment> = {
		start: Enum.VerticalAlignment.Top,
		center: Enum.VerticalAlignment.Center,
		end: Enum.VerticalAlignment.Bottom,
	};
	return { h: hmap[a], v: vmap[a] };
}

function toFlex(dir: "vertical" | "horizontal", justify?: Justify) {
	const j = justify ?? "start";
	const map: Record<Justify, Enum.UIFlexAlignment> = {
		start: Enum.UIFlexAlignment.None,
		center: Enum.UIFlexAlignment.None,
		end: Enum.UIFlexAlignment.None,
		spaceBetween: Enum.UIFlexAlignment.SpaceBetween,
		spaceEvenly: Enum.UIFlexAlignment.SpaceEvenly,
	};
	return dir === "horizontal"
		? { h: map[j], v: Enum.UIFlexAlignment.None }
		: { h: Enum.UIFlexAlignment.None, v: map[j] };
}

function makePadding(p?: StackProps["padding"]) {
	if (typeOf(p) === "number") {
		const n = p as number;
		return New("UIPadding")({
			PaddingTop: new UDim(0, n),
			PaddingRight: new UDim(0, n),
			PaddingBottom: new UDim(0, n),
			PaddingLeft: new UDim(0, n),
		});
	}
	const obj = (p as { top?: number; right?: number; bottom?: number; left?: number }) ?? {};
	return New("UIPadding")({
		PaddingTop: new UDim(0, obj.top ?? 0),
		PaddingRight: new UDim(0, obj.right ?? 0),
		PaddingBottom: new UDim(0, obj.bottom ?? 0),
		PaddingLeft: new UDim(0, obj.left ?? 0),
	});
}

export function Stack(props: StackProps): Frame | ScrollingFrame {
	const dir = props.direction ?? "vertical";
	const gap = props.gap ?? 6;
	const { h, v } = toAlignment(props.align);
	const flex = toFlex(dir, props.justify);
	const auto = props.autoSize ?? (dir === "vertical" ? "y" : "x");

	const isScroll = props.scroll ?? false;
	const container = isScroll
		? (New("ScrollingFrame")({
				Name: props.Name ?? "Stack",
				BackgroundTransparency: props.BackgroundTransparency ?? 1,
				Size: props.Size ?? new UDim2(1, 0, 0, 0),
				AutomaticCanvasSize: dir === "vertical" ? Enum.AutomaticSize.Y : Enum.AutomaticSize.X,
				CanvasSize: new UDim2(0, 0, 0, 0),
				ScrollingDirection: dir === "vertical" ? Enum.ScrollingDirection.Y : Enum.ScrollingDirection.X,
				ScrollBarThickness: 8,
				Position: props.Position,
				AnchorPoint: props.AnchorPoint,
				LayoutOrder: props.LayoutOrder,
				ZIndex: props.ZIndex,
			}) as unknown as ScrollingFrame)
		: (New("Frame")({
				Name: props.Name ?? "Stack",
				BackgroundTransparency: props.BackgroundTransparency ?? 1,
				Size: props.Size ?? new UDim2(1, 0, 0, 0),
				AutomaticSize:
					auto === "both"
						? Enum.AutomaticSize.XY
						: auto === "x"
							? Enum.AutomaticSize.X
							: auto === "y"
								? Enum.AutomaticSize.Y
								: Enum.AutomaticSize.None,
				Position: props.Position,
				AnchorPoint: props.AnchorPoint,
				LayoutOrder: props.LayoutOrder,
				ZIndex: props.ZIndex,
			}) as unknown as Frame);

	const layout = New("UIListLayout")({
		FillDirection: dir === "vertical" ? Enum.FillDirection.Vertical : Enum.FillDirection.Horizontal,
		Padding: new UDim(0, gap),
		SortOrder: Enum.SortOrder.LayoutOrder,
		HorizontalAlignment: dir === "vertical" ? h : undefined,
		VerticalAlignment: dir === "horizontal" ? v : undefined,
		HorizontalFlex: dir === "horizontal" ? flex.h : Enum.UIFlexAlignment.None,
		VerticalFlex: dir === "vertical" ? flex.v : Enum.UIFlexAlignment.None,
	});

	const padding = makePadding(props.padding ?? 0);

	(container as Instance).ClearAllChildren();
	padding.Parent = container;
	layout.Parent = container;
	if (props[Children] !== undefined) {
		(container as Instance)[Children] = props[Children];
	}
	return container;
}

export function VStack(props: Omit<StackProps, "direction">): Frame | ScrollingFrame {
	return Stack({ ...props, direction: "vertical" });
}

export function HStack(props: Omit<StackProps, "direction">): Frame | ScrollingFrame {
	return Stack({ ...props, direction: "horizontal" });
}

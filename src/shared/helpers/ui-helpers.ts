import { New } from "@rbxts/fusion";

export const Flex = {
	Shrink: () =>
		New("UIFlexItem")({
			FlexMode: Enum.UIFlexMode.Shrink,
		}),
	Grow: () =>
		New("UIFlexItem")({
			FlexMode: Enum.UIFlexMode.Grow,
		}),
	Fill: () =>
		New("UIFlexItem")({
			FlexMode: Enum.UIFlexMode.Fill,
		}),
};

export const makeDragger = () => {
	const dragger = New("UIDragDetector")({
		Name: "makeDragger",
	});
	return dragger;
};

function VerticalContainer(centered: boolean) {
	return New("UIListLayout")({
		FillDirection: Enum.FillDirection.Vertical,
		VerticalAlignment: centered ? Enum.VerticalAlignment.Center : Enum.VerticalAlignment.Top,
		VerticalFlex: Enum.UIFlexAlignment.SpaceEvenly,
		HorizontalAlignment: Enum.HorizontalAlignment.Center,
		HorizontalFlex: Enum.UIFlexAlignment.SpaceEvenly,
		SortOrder: Enum.SortOrder.LayoutOrder,
	});
}
function HorizontalContainer(centered: boolean) {
	return New("UIListLayout")({
		FillDirection: Enum.FillDirection.Horizontal,
		VerticalAlignment: Enum.VerticalAlignment.Center,
		VerticalFlex: Enum.UIFlexAlignment.SpaceEvenly,
		HorizontalAlignment: centered ? Enum.HorizontalAlignment.Center : Enum.HorizontalAlignment.Left,
		HorizontalFlex: Enum.UIFlexAlignment.SpaceEvenly,
		SortOrder: Enum.SortOrder.LayoutOrder,
	});
}

export const makeLayout = (layoutStyle: "vertical" | "horizontal" | "none", centered: boolean) => {
	switch (layoutStyle) {
		case "vertical":
			return VerticalContainer(centered);
		case "horizontal":
			return HorizontalContainer(centered);
		default:
			return New("UIListLayout")({});
	}
};

export const makeCorner = (radius: number) => New("UICorner")({ CornerRadius: new UDim(0, radius) });

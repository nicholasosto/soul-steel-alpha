import { New } from "@rbxts/fusion";

export function makePadding(amount: number = 5) {
	return New("UIPadding")({
		PaddingLeft: new UDim(0, amount),
		PaddingRight: new UDim(0, amount),
		PaddingTop: new UDim(0, amount),
		PaddingBottom: new UDim(0, amount),
	});
}

export function VerticalLayout(spacing: number = 5) {
	return New("UIListLayout")({
		SortOrder: Enum.SortOrder.LayoutOrder,
		Padding: new UDim(0, 5),
		FillDirection: Enum.FillDirection.Vertical,
	});
}

export function HorizontalLayout(spacing: number = 5) {
	return New("UIListLayout")({
		SortOrder: Enum.SortOrder.LayoutOrder,
		Padding: new UDim(0, spacing),
		FillDirection: Enum.FillDirection.Horizontal,
		HorizontalFlex: Enum.UIFlexAlignment.SpaceEvenly,
	});
}

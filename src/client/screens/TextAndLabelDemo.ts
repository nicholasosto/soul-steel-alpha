import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { Label, TextBox } from "@trembus/ss-fusion";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

function Section(title: string, children: Instance[] = []): Frame {
	return New("Frame")({
		Name: `Section_${title}`,
		BackgroundTransparency: 1,
		Size: UDim2.fromOffset(600, 0),
		AutomaticSize: Enum.AutomaticSize.Y,
		[Children]: [
			// Title
			Label({
				text: title,
				variant: "heading",
				Size: UDim2.fromOffset(580, 28),
			}) as Instance,
			// Spacer
			New("Frame")({
				BackgroundTransparency: 1,
				Size: UDim2.fromOffset(1, 6),
			}),
			New("UIListLayout")({
				SortOrder: Enum.SortOrder.LayoutOrder,
				Padding: new UDim(0, 6),
			}),
			...children,
		],
	});
}

function LabelVariations(): Frame {
	const items: Instance[] = [
		Label({ text: "Heading Label", variant: "heading" }) as Instance,
		Label({ text: "Body Label - default body text style", variant: "body" }) as Instance,
		Label({ text: "Caption Label - helper or hint text", variant: "caption" }) as Instance,
		Label({ text: "Small Label - compact UI text", variant: "small" }) as Instance,
		Label({
			text: "Stroke + Color",
			variant: "body",
			textStroke: true,
			textColor: Color3.fromRGB(200, 230, 255),
		}) as Instance,
	];
	return Section("Label Variations", items);
}

function TextBoxVariations(): Frame {
	// Reactive values to show what the user types
	const singleValue = Value("");
	const validatedValue = Value("");
	const multilineValue = Value("");
	const smallValue = Value("");
	const mediumValue = Value("");
	const largeValue = Value("");
	const maxLenValue = Value("");

	const items: Instance[] = [
		// Default single-line
		New("Frame")({
			BackgroundTransparency: 1,
			Size: UDim2.fromOffset(580, 64),
			[Children]: [
				TextBox({
					placeholder: "Single-line input...",
					onChanged: (text) => singleValue.set(text),
					Size: UDim2.fromOffset(580, 28),
				}) as Instance,
				Label({ text: singleValue, variant: "caption" }) as Instance,
				New("UIListLayout")({ SortOrder: Enum.SortOrder.LayoutOrder, Padding: new UDim(0, 4) }),
			],
		}),

		// With validation (min length 3)
		New("Frame")({
			BackgroundTransparency: 1,
			Size: UDim2.fromOffset(580, 64),
			[Children]: [
				TextBox({
					placeholder: "Validated (>= 3 chars)",
					validate: (text) => text.size() >= 3,
					onChanged: (text) => validatedValue.set(text),
					Size: UDim2.fromOffset(580, 28),
				}) as Instance,
				Label({ text: validatedValue, variant: "caption" }) as Instance,
				New("UIListLayout")({ SortOrder: Enum.SortOrder.LayoutOrder, Padding: new UDim(0, 4) }),
			],
		}),

		// Multiline large box
		New("Frame")({
			BackgroundTransparency: 1,
			Size: UDim2.fromOffset(580, 140),
			[Children]: [
				TextBox({
					placeholder: "Multiline message...",
					multiline: true,
					maxLength: 500,
					size: "large",
					onChanged: (text) => multilineValue.set(text),
					Size: UDim2.fromOffset(580, 96),
				}) as Instance,
				Label({ text: multilineValue, variant: "caption" }) as Instance,
				New("UIListLayout")({ SortOrder: Enum.SortOrder.LayoutOrder, Padding: new UDim(0, 4) }),
			],
		}),

		// Size variants: small / medium / large
		New("Frame")({
			BackgroundTransparency: 1,
			Size: UDim2.fromOffset(580, 108),
			[Children]: [
				TextBox({
					placeholder: "Small size",
					size: "small",
					onChanged: (t) => smallValue.set(t),
					Size: UDim2.fromOffset(580, 24),
				}) as Instance,
				Label({ text: smallValue, variant: "caption" }) as Instance,
				TextBox({
					placeholder: "Medium size",
					size: "medium",
					onChanged: (t) => mediumValue.set(t),
					Size: UDim2.fromOffset(580, 28),
				}) as Instance,
				Label({ text: mediumValue, variant: "caption" }) as Instance,
				TextBox({
					placeholder: "Large size",
					size: "large",
					onChanged: (t) => largeValue.set(t),
					Size: UDim2.fromOffset(580, 32),
				}) as Instance,
				Label({ text: largeValue, variant: "caption" }) as Instance,
				New("UIListLayout")({ SortOrder: Enum.SortOrder.LayoutOrder, Padding: new UDim(0, 4) }),
			],
		}),

		// Max length
		New("Frame")({
			BackgroundTransparency: 1,
			Size: UDim2.fromOffset(580, 64),
			[Children]: [
				TextBox({
					placeholder: "Max length = 10",
					maxLength: 10,
					onChanged: (t) => maxLenValue.set(t),
					Size: UDim2.fromOffset(580, 28),
				}) as Instance,
				Label({ text: maxLenValue, variant: "caption" }) as Instance,
				New("UIListLayout")({ SortOrder: Enum.SortOrder.LayoutOrder, Padding: new UDim(0, 4) }),
			],
		}),
	];

	return Section("TextBox Variations", items);
}

export const TextAndLabelDemo = New("ScreenGui")({
	Name: "TextAndLabelDemo",
	ResetOnSpawn: false,
	DisplayOrder: 50,
	Parent: playerGui,
	[Children]: [
		New("Frame")({
			Name: "Container",
			BackgroundTransparency: 1,
			Size: UDim2.fromScale(1, 1),
			[Children]: [
				New("ScrollingFrame")({
					Name: "Scroll",
					Active: true,
					ScrollingDirection: Enum.ScrollingDirection.Y,
					AutomaticCanvasSize: Enum.AutomaticSize.Y,
					CanvasSize: new UDim2(0, 0, 0, 0),
					BackgroundTransparency: 1,
					Size: UDim2.fromScale(1, 1),
					ScrollBarImageTransparency: 0.5,
					[Children]: [
						New("UIListLayout")({
							SortOrder: Enum.SortOrder.LayoutOrder,
							Padding: new UDim(0, 12),
							FillDirection: Enum.FillDirection.Vertical,
							HorizontalAlignment: Enum.HorizontalAlignment.Left,
						}),
						New("UIPadding")({
							PaddingTop: new UDim(0, 16),
							PaddingLeft: new UDim(0, 16),
							PaddingRight: new UDim(0, 16),
							PaddingBottom: new UDim(0, 16),
						}),
						LabelVariations(),
						TextBoxVariations(),
					],
				}),
			],
		}),
	],
});

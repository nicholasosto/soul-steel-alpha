import Fusion, { New } from "@rbxts/fusion";
import { IconButton } from "./IconButton";
import { ImageConstants, MenuButtonImageMap } from "shared/asset-ids";

const { Value } = Fusion;

export interface ButtonBarProps extends Fusion.PropertyTable<Frame> {
	buttons: Array<GuiButton>;
}

const MenuButtons = {
	Character: IconButton({
		Name: "CharacterButton",
		icon: MenuButtonImageMap.Character,
		onClick: () => {
			print("Character button clicked");
		},
	}),
	Inventory: IconButton({
		Name: "InventoryButton",
		icon: MenuButtonImageMap.Inventory,
		onClick: () => {
			print("Inventory button clicked");
		},
	}),
	Settings: IconButton({
		Name: "SettingsButton",
		icon: MenuButtonImageMap.Settings,
		onClick: () => {
			print("Settings button clicked");
		},
	}),
};

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
		[Fusion.Children]: props.buttons.map((button, index) => {
			return button;
		}),
	});

	const ListLayout = New("UIListLayout")({
		SortOrder: Enum.SortOrder.LayoutOrder,
		Padding: new UDim(0, buttonSpacing),
		FillDirection: Enum.FillDirection.Horizontal,
		Parent: uiComponent,
	});

	const Padding = New("UIPadding")({
		PaddingLeft: new UDim(0, framePadding),
		PaddingRight: new UDim(0, framePadding),
		PaddingTop: new UDim(0, framePadding),
		PaddingBottom: new UDim(0, framePadding),
		Parent: uiComponent,
	});

	return uiComponent;
}

export const MenuButtonBar = HorizontalButtonBar({
	buttons: [MenuButtons.Character, MenuButtons.Inventory, MenuButtons.Settings],
});

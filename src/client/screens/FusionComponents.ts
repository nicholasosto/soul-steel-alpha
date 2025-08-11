import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { Avatar, AvatarProps, AvatarVariantSize, MessageBox, MessageBoxProps, Stack } from "@trembus/ss-fusion";
import { HorizontalLayout, VerticalLayout } from "client/client-ui";
import { ButtonFromCombo, CooldownButtonFromCombo } from "../demos/PackageButtons";
import { createMessageBoxDemo } from "client/demos/PackageMessageBox";

/*------------------------------ AVATAR VERIFICATION ------------------------------ */
const userId = Players.LocalPlayer.UserId;
const avatarPropsRound: AvatarProps = {
	userId: userId,
	shape: "rounded",
	size: "medium",
	showBorder: true,
};
const avatarPropsSquare: AvatarProps = {
	userId: userId,
	shape: "square",
	size: "small",
	showBorder: true,
};
const avatarPropsCircular: AvatarProps = {
	userId: userId,
	shape: "circle",
	size: "large",
	showBorder: true,
	borderColor: Color3.fromRGB(0, 255, 0), // Green border for circular avatar
};
const AvatarDemoFrame = New("Frame")({
	Size: new UDim2(0, 500, 0, 150),
	Position: new UDim2(0.5, -150, 0.5, -50),
	AnchorPoint: new Vector2(0.5, 0.5),
	BackgroundColor3: Color3.fromRGB(255, 255, 255),
	BorderSizePixel: 0,
	BackgroundTransparency: 1,
	ClipsDescendants: true,
	[Children]: {
		Layout: HorizontalLayout(4),
		Info: Avatar(avatarPropsCircular),
		Warning: Avatar(avatarPropsSquare),
		Success: Avatar(avatarPropsRound),
	},
});

const ButtonDemoFrame = New("Frame")({
	Size: new UDim2(1, 0, 0, 150),
	Position: new UDim2(0.5, 0, 1, 0),
	AnchorPoint: new Vector2(0.5, 1),
	BackgroundColor3: Color3.fromRGB(255, 255, 255),
	BorderSizePixel: 0,
	BackgroundTransparency: 1,
	ClipsDescendants: true,
	[Children]: {
		Layout: Stack({
			direction: "row",
			children: [ButtonFromCombo("Ghost"), ButtonFromCombo("Large_Accent"), ButtonFromCombo("Ghost_Disabled")],
		}),
	},
});

export function createSSFusionScreen(parent: Instance): ScreenGui {
	const screen = New("ScreenGui")({
		Name: "SSFusionScreen",
		ResetOnSpawn: false,
		Parent: parent,
		[Children]: {
			Layout: HorizontalLayout(4),
			MessageBoxDemo: createMessageBoxDemo(),
			AvatarDemo: CooldownButtonFromCombo("CooldownButton1"),
		},
	});

	return screen;
}

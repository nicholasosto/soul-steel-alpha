import { Players } from "@rbxts/services";
import { IconButton, TestButtonProps } from "client/client-ui";
import Fusion, { Children, New, OnEvent } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";

import { ServerFunction } from "./event-dispatcher";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
const testButton = IconButton(TestButtonProps.MenuItem);
const isSelectedTest = Fusion.Value(false);
const isHoveredTest = Fusion.Value(false);
const testButton2 = IconButton({
	icon: ImageConstants.Gems.Colorable,
	Size: UDim2.fromOffset(132, 132),
	BackgroundImageId: ImageConstants.TextureImage.BoneDoily,
	isSelected: isSelectedTest,
	isHovered: isHoveredTest,
	Name: "TestButton2",
	onClick: () => {
		print("Test button clicked, selected state:", isSelectedTest.get());
		ServerFunction("ABILITY_ACTIVATE", "Melee");
	},
});
const testScreen = New("ScreenGui")({
	Parent: playerGui,
	ResetOnSpawn: false,
	Name: "TestScreen",
	DisplayOrder: 1,
	[Children]: {
		IconButton2: testButton2,
	},
});

print("UI Client initialized with test button:", testScreen.FindFirstChild("IconButton"));
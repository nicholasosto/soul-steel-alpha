import { Players } from "@rbxts/services";
import { IconButton, TestButtonProps } from "client/client-ui";
import Fusion, { Children, New, OnEvent } from "@rbxts/fusion";
import { ImageConstants } from "shared/asset-ids";

import { ServerFunction } from "./event-dispatcher";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
const testButton = IconButton(TestButtonProps.MenuItem);
const isSelectedTest = Fusion.Value(false);
const isHoveredTest = Fusion.Value(false);
const meleeButton = IconButton({
	icon: ImageConstants.Gems.Colorable,
	Size: UDim2.fromOffset(132, 132),
	BackgroundImageId: ImageConstants.TextureImage.WavyMetal,
	Name: "MeleeButton",
	onClick: () => {
		print("Melee button clicked");
		ServerFunction("ABILITY_ACTIVATE", "Melee");
	},
});
const testScreen = New("ScreenGui")({
	Parent: playerGui,
	ResetOnSpawn: false,
	Name: "TestScreen",
	DisplayOrder: 1,
	[Children]: {
		MeleeButton: meleeButton,
	},
});

print("UI Client initialized with melee button:", testScreen.FindFirstChild("MeleeButton") !== undefined);

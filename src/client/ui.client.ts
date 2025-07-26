import { Players } from "@rbxts/services";
import { IconButton, TestButtonProps } from "client/client-ui";
import { MenuButtonBar } from "./client-ui/buttons/ButtonBar";
import { New, Children } from "@rbxts/fusion";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
MenuButtonBar.Parent = playerGui;

New("ScreenGui")({
	Name: "MAIN_UI",
	ResetOnSpawn: false,
	Parent: playerGui,
	DisplayOrder: 10,
	[Children]: {
		MenuBar: MenuButtonBar,
	},
}) as ScreenGui;

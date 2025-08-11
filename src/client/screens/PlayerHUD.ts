import Fusion, { Children, New } from "@rbxts/fusion";
import { Players } from "@rbxts/services";
import { MenuButtonBar, ResourceBars } from "client/client-ui/organisms";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

/* ---------------------------------- TEXT BOXES ---------------------------------- */
export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		DisplayOrder: 10,
		[Children]: {
			ResourceBar: ResourceBars({
				resourceKeys: ["Health", "Mana", "Stamina", "Experience"],
				Position: new UDim2(0.05, 0, 0.05, 0), // Positioning the resource bars at the bottom left
				Size: new UDim2(0.2, 0, 0.1, 0), // Adjust size as needed
			}),
			MenuBar: MenuButtonBar,
		},
	});
}

/**
 * @file src/client/client-ui/organisms/panels/CharacterPanelDemo.ts
 * @module CharacterPanelDemo
 * @layer Client/UI/Demo
 * @description Demo showing the CharacterPanel component with toggle functionality
 *
 * @author Soul Steel Alpha Development Team
 * @since 1.0.0
 * @lastUpdated 2025-08-09 - Created character panel demo
 */

import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { IconButton } from "@trembus/ss-fusion";
import { CharacterPanel } from "./CharacterPanel";

export interface CharacterPanelDemoProps {
	Name?: string;
	Parent?: Instance;
}

/**
 * Demo component for the CharacterPanel with a toggle button
 */
export function CharacterPanelDemo(props: CharacterPanelDemoProps): ScreenGui {
	const panelVisible = Value(false);

	const screenGui = New("ScreenGui")({
		Name: props.Name ?? "CharacterPanelDemo",
		Parent: props.Parent,
		ResetOnSpawn: false,
		ZIndexBehavior: Enum.ZIndexBehavior.Sibling,
		[Children]: [
			// Toggle Button
			IconButton({
				Size: new UDim2(0, 80, 0, 80),
				Position: new UDim2(0, 20, 0, 20),
				AnchorPoint: new Vector2(0, 0),
				onClick: () => {
					panelVisible.set(!panelVisible.get());
				},
				icon: "rbxassetid://3926307971", // Person icon
				variant: "secondary",
			}) as unknown as Frame,

			// Character Panel
			CharacterPanel({
				visible: panelVisible,
				onClose: () => {
					panelVisible.set(false);
				},
			}),
		],
	});

	return screenGui;
}

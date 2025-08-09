/**
 * @file src/client/demos/ui/CharacterPanelDemo.ts
 * @description Demo showing the CharacterPanel component with toggle functionality (moved from client-ui)
 */
import Fusion, { Children, New, Value } from "@rbxts/fusion";
import { IconButton } from "@trembus/ss-fusion";
import { CharacterPanel } from "client/client-ui/organisms/panels/CharacterPanel";

export interface CharacterPanelDemoProps {
	Name?: string;
	Parent?: Instance;
}

export function CharacterPanelDemo(props: CharacterPanelDemoProps): ScreenGui {
	const panelVisible = Value(false);

	const screenGui = New("ScreenGui")({
		Name: props.Name ?? "CharacterPanelDemo",
		Parent: props.Parent,
		ResetOnSpawn: false,
		ZIndexBehavior: Enum.ZIndexBehavior.Sibling,
		[Children]: [
			IconButton({
				Size: new UDim2(0, 80, 0, 80),
				Position: new UDim2(0, 20, 0, 20),
				AnchorPoint: new Vector2(0, 0),
				onClick: () => panelVisible.set(!panelVisible.get()),
				icon: "rbxassetid://3926307971",
				variant: "secondary",
			}) as unknown as Frame,
			CharacterPanel({
				visible: panelVisible,
				onClose: () => panelVisible.set(false),
			}),
		],
	});

	return screenGui;
}

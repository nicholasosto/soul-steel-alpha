import { Children, New } from "@rbxts/fusion";
import { CharacterCardInstance } from "./hud-components";
import { AbilityBar } from "./hud-components/AbilityBar";
import { Panel, TextBox } from "@trembus/ss-fusion";
// Note: ss-fusion 2.2.3 publishes organisms/atoms subpaths; ensure tsconfig resolves types
import { PanelWindow } from "@trembus/ss-fusion/organisms/PanelWindow";
import { DragHandle } from "@trembus/ss-fusion/atoms/DragHandle";
/* ---------------------------------- TEXT BOXES ---------------------------------- */
const PanelTest = Panel({
	Size: UDim2.fromScale(0.5, 0.5),
	Position: UDim2.fromScale(0.25, 0.25),
	shadow: "md",
	variant: "primary",
	children: [TextBox({})],
});

// Small demo window showcasing PanelWindow + DragHandle (UIDragDetector)
function createDraggableDemoWindow(): Instance {
	const win = PanelWindow({
		titleLabel: "Demo Window",
		panelVariant: "background",
		closeButton: true,
		Size: UDim2.fromOffset(320, 200),
		Position: UDim2.fromScale(0.75, 0.25),
		AnchorPoint: new Vector2(0.5, 0.5),
		children: [
			Panel({
				____FusionOnEventDragBegin: (position) => {
					print("Drag began at: ", position);
				},
				Size: UDim2.fromScale(1, 1),
				variant: "accent",
				children: [TextBox({ placeholder: "Type here..." })],
			}),
		],
	});

	// Allow dragging the window by its title area using movement deltas
	DragHandle({
		Size: UDim2.fromOffset(320, 32),
		Parent: win,
		onDelta: (d) => {
			const pos = win.Position;
			win.Position = new UDim2(
				pos.X.Scale + d.X.Scale,
				pos.X.Offset + d.X.Offset,
				pos.Y.Scale + d.Y.Scale,
				pos.Y.Offset + d.Y.Offset,
			);
		},
	});

	return win;
}
export function createPlayerHUD(parent: Instance): ScreenGui {
	return New("ScreenGui")({
		Name: "PlayerHUD",
		ResetOnSpawn: false,
		Parent: parent,
		Enabled: true,
		DisplayOrder: 10,
		[Children]: {
			//Panel: PanelTest,
			CharacterInfoCard: CharacterCardInstance,
			AbilityBar: AbilityBar(["Earthquake", "Melee", "Ice-Rain", "Soul-Drain"]),
			DemoWindow: createDraggableDemoWindow(),
		},
	});
}

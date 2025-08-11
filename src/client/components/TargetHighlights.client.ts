import { Players } from "@rbxts/services";
import { PlayerStateInstance } from "client/states/player-state";
import { Observer } from "@rbxts/fusion";

// Lightweight: reflect target/hoverTarget with highlights for feedback
const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

function ensure(name: string, color: Color3, fill = 0.7, outline = 0.2): Highlight {
	let hl = playerGui.FindFirstChild(name) as Highlight | undefined;
	if (!hl) {
		hl = new Instance("Highlight");
		hl.Name = name;
		hl.DepthMode = Enum.HighlightDepthMode.Occluded;
		hl.Parent = playerGui;
	}
	hl.FillColor = color;
	hl.FillTransparency = fill;
	hl.OutlineColor = Color3.fromRGB(255, 255, 255);
	hl.OutlineTransparency = outline;
	return hl;
}

// Hover target highlight
const hoverHL = ensure("HoverTargetHL", Color3.fromRGB(100, 200, 255), 0.85, 0.5);
Observer(PlayerStateInstance.hoverTarget).onChange(() => {
	hoverHL.Adornee = PlayerStateInstance.hoverTarget.get();
});

// Locked target highlight
const lockHL = ensure("LockedTargetHL", Color3.fromRGB(255, 200, 64), 0.65, 0.1);
Observer(PlayerStateInstance.target).onChange(() => {
	lockHL.Adornee = PlayerStateInstance.target.get();
});
